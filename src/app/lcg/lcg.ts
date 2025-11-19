import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';

interface ValidationTest {
  calculatedValue: number;
  lowerLimit: number;
  upperLimit: number;
  passed: boolean;
  runs?: number;
}

@Component({
  selector: 'app-lcg',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './lcg.html',
  styleUrl: './lcg.css',
})
export class Lcg {

  // Parámetros del usuario
  seed: number = 37;
  multiplier: number = 19;
  increment: number = 33;
  count: number = 100;

  // Calculados automáticamente
  g: number = 0;
  modulus: number = 1;
  period: number = 1;

  // Resultados
  generatedNumbers: number[] = [];
  normalizedNumbers: number[] = [];

  // Pruebas de validación
  meanTest: ValidationTest = { calculatedValue: 0, lowerLimit: 0, upperLimit: 0, passed: false };
  varianceTest: ValidationTest = { calculatedValue: 0, lowerLimit: 0, upperLimit: 0, passed: false };
  correlationTest: ValidationTest = { calculatedValue: 0, lowerLimit: 0, upperLimit: 0, passed: false };
  chiSquareTest: ValidationTest = { calculatedValue: 0, lowerLimit: 0, upperLimit: 0, passed: false };

  validationApproved: boolean | null = null;

  chartOptions: any = {
    series: [{ name: 'Números Aleatorios', data: [] }],
    chart: { type: 'scatter', height: 350, zoom: { enabled: true } },
    xaxis: { title: { text: 'Índice' } },
    yaxis: { title: { text: 'Valor Normalizado' }, min: 0, max: 1 },
    colors: ['#3b82f6'],
    markers: { size: 6 }
  };

  // GENERADOR LCG
  generateNumbers() {
    if (!this.validateInputs()) return;

    this.g = Math.max(0, Math.ceil(Math.log2(Math.max(1, this.count))));
    this.modulus = Math.pow(2, this.g);
    this.period = this.modulus;

    if (this.seed < 0 || this.seed >= this.modulus) {
      alert(`La semilla debe cumplir 0 ≤ semilla < ${this.modulus}.`);
      return;
    }

    this.generatedNumbers = [];
    this.normalizedNumbers = [];

    let current = this.seed;

    for (let i = 0; i < this.count; i++) {
      current = (this.multiplier * current + this.increment) % this.modulus;
      const normalized = current / (this.modulus - 1);

      this.generatedNumbers.push(current);
      this.normalizedNumbers.push(normalized);
    }

    this.updateChart();
    this.runValidationTests();
  }

  // PRUEBAS DE VALIDACIÓN
  runValidationTests() {
    const r = this.normalizedNumbers;
    const n = r.length;

    // 1) Prueba de la Media
    const media = r.reduce((a, b) => a + b, 0) / n;
    const LI_media = 0.5 - (1.96 / Math.sqrt(12 * n));
    const LS_media = 0.5 + (1.96 / Math.sqrt(12 * n));
    const mediaOK = media >= LI_media && media <= LS_media;

    this.meanTest = {
      calculatedValue: media,
      lowerLimit: LI_media,
      upperLimit: LS_media,
      passed: mediaOK
    };

    // 2) Prueba de Varianza
    const varianza = r.reduce((sum, v) => sum + Math.pow(v - media, 2), 0) / (n - 1);
    const var_esp = 1 / 12;  // 0.08333

    const alpha = 0.05;
    const gl = n - 1;
    const z = 1.96;

    // Aproximación Chi-cuadrado Wilson–Hilferty
    function chiAprox(p: number) {
      const t = 1 - (2 / (9 * gl)) + (Math.sqrt(2 / (9 * gl)) * p);
      return gl * Math.pow(t, 3);
    }

    // χ²(α/2)
    const chi_sup = chiAprox(1.96); // χ²(0.025)
    // χ²((1−α)/2)
    const chi_inf = chiAprox(-1.96); // χ²(0.975)

    const LI_var = chi_inf / (12 * gl);
    const LS_var = chi_sup / (12 * gl);

    const varOK = varianza >= LI_var && varianza <= LS_var;

    this.varianceTest = {
      calculatedValue: varianza,
      lowerLimit: LI_var,
      upperLimit: LS_var,
      passed: varOK
    };

    // 3) Prueba de Corridas Arriba-Abajo
    const corridasResult = this.pruebaCorridasArribaAbajo(r);
    const corridasOK = corridasResult.passed;

    this.correlationTest = {
      calculatedValue: corridasResult.Z0,
      lowerLimit: -1.96,
      upperLimit: 1.96,
      passed: corridasOK,
      runs: corridasResult.runs
    };


    // 4) Prueba de Chi-Cuadrado
    const chi = this.pruebaChiCuadrado(r);
    const chiOK = chi.passed;

    this.chiSquareTest = {
      calculatedValue: chi.value,
      lowerLimit: chi.lowerLimit,
      upperLimit: chi.upperLimit,
      passed: chiOK
    };

    this.validationApproved = mediaOK && varOK && corridasOK && chiOK;
  }

  // PRUEBA DE INDEPENDENCIA: CORRIDAS ARRIBA-ABAJO
  pruebaCorridasArribaAbajo(r: number[]) {
    const n = r.length;

    // Secuencia S: 1 si sube, 0 si baja
    let S: number[] = [];
    for (let i = 1; i < n; i++) {
      S.push(r[i] > r[i - 1] ? 1 : 0);
    }

    // Contar corridas observadas
    let C0 = 1;
    for (let i = 1; i < S.length; i++) {
      if (S[i] !== S[i - 1]) C0++;
    }

    // Fórmulas CORRECTAS de Corridas Arriba–Abajo (PDF)
    const mu = (2 * n - 1) / 3;
    const varianza = (16 * n - 29) / 90;
    const sigma = Math.sqrt(varianza);

    const Z0 = Math.abs(C0 - mu) / sigma;

    const passed = Z0 <= 1.96;

    return { Z0, passed, runs: C0 };

  }


  // PRUEBA DE UNIFORMIDAD: CHI CUADRADO
  pruebaChiCuadrado(r: number[]) {

    const n = r.length;

    // m = número de intervalos = √n
    const k = Math.floor(Math.sqrt(n));

    // Crear intervalos del mismo tamaño
    const intervalSize = 1 / k;

    // Frecuencias observadas Oi
    let O = new Array(k).fill(0);

    r.forEach(v => {
      const index = Math.min(Math.floor(v / intervalSize), k - 1);
      O[index]++;
    });

    // Frecuencia esperada Ei = n/m
    const E = n / k;

    // Cálculo del estadístico Chi-cuadrado
    let chiCalc = 0;
    for (let i = 0; i < k; i++) {
      chiCalc += Math.pow(O[i] - E, 2) / E;
    }

    // VALOR CRÍTICO DE TABLA
    const gl = k - 1;

    // Tabla mínima
    const chiTable: { [key: number]: number } = {
      1: 3.841,
      2: 5.991,
      3: 7.815,
      4: 9.488,
      5: 11.070,
      6: 12.592,
      7: 14.067,
      8: 15.507,
      9: 16.919,
      10: 18.307,
      11: 19.675,
      12: 21.026,
      13: 22.362,
      14: 23.685,
      15: 24.996,
      16: 26.296,
      17: 27.587,
      18: 28.869,
      19: 30.144,
      20: 31.410,
      25: 37.652,
      30: 43.773
    };

    // Si gl no está en la tabla, aproximamos linealmente
    const chiCritical = chiTable[gl] ?? (gl + 2 * Math.sqrt(gl));

    // Decisión
    const passed = chiCalc < chiCritical;

    return {
      value: chiCalc,
      lowerLimit: 0,
      upperLimit: chiCritical,
      passed
    };
  }


  // REGENERAR NÚMEROS (si fallan las pruebas)
  regenerate() {
    const multipliers = [5, 7, 11, 13, 17, 19, 21, 23, 27, 29];
    const increments = [1, 3, 5, 7, 11, 13, 15, 17, 19, 21];

    this.multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    this.increment = increments[Math.floor(Math.random() * increments.length)];
    this.seed = Math.floor(Math.random() * (this.modulus - 1));

    this.generateNumbers();
  }

  // GRÁFICO
  updateChart() {
    const scatterData = this.normalizedNumbers.map((value, index) => ({
      x: index + 1,
      y: value
    }));

    this.chartOptions = {
      ...this.chartOptions,
      series: [{ name: 'Números Aleatorios', data: scatterData }]
    };
  }

  // VALIDACIONES BÁSICAS
  validateInputs(): boolean {
    if (!Number.isInteger(this.seed) ||
      !Number.isInteger(this.multiplier) ||
      !Number.isInteger(this.increment) ||
      !Number.isInteger(this.count)) {
      alert('Todos los parámetros deben ser enteros.');
      return false;
    }

    if (this.count <= 0) {
      alert('La cantidad debe ser mayor que 0.');
      return false;
    }

    if (this.multiplier <= 0) {
      alert('El multiplicador debe ser mayor que 0.');
      return false;
    }

    if (this.increment < 0) {
      alert('El incremento debe ser mayor o igual a 0.');
      return false;
    }

    return true;
  }

  reset() {
    this.seed = 37;
    this.multiplier = 19;
    this.increment = 33;
    this.count = 100;

    this.g = 0;
    this.modulus = 1;
    this.period = 1;

    this.generatedNumbers = [];
    this.normalizedNumbers = [];

    this.validationApproved = null;

    this.meanTest = { calculatedValue: 0, lowerLimit: 0, upperLimit: 0, passed: false };
    this.varianceTest = { calculatedValue: 0, lowerLimit: 0, upperLimit: 0, passed: false };
    this.correlationTest = { calculatedValue: 0, lowerLimit: 0, upperLimit: 0, passed: false };
    this.chiSquareTest = { calculatedValue: 0, lowerLimit: 0, upperLimit: 0, passed: false };

    this.chartOptions.series = [{ data: [] }];
  }

  // VISTA DE TABLA
  getDisplayNumbers() {
    return this.normalizedNumbers.map((num, index) => ({
      xIndex: `X${index + 1}`,
      rIndex: `r${index + 1}`,
      original: this.generatedNumbers[index],
      normalized: num.toFixed(6)
    }));
  }
}

