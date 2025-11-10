import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';

interface ValidationTest {
  calculatedValue: number;
  lowerLimit: number;
  upperLimit: number;
  passed: boolean;
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
  
  validationApproved: boolean | null = null;

  chartOptions: any = {
    series: [{ name: 'Números Aleatorios', data: [] }],
    chart: { type: 'scatter', height: 350, zoom: { enabled: true } },
    xaxis: { title: { text: 'Índice' } },
    yaxis: { title: { text: 'Valor Normalizado' }, min: 0, max: 1 },
    colors: ['#3b82f6'],
    markers: { size: 6 }
  };

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

  runValidationTests() {
    const n = this.normalizedNumbers.length;

    // Prueba de Media
    const mean = this.normalizedNumbers.reduce((a, b) => a + b, 0) / n;
    const LI_mean = 0.5 - (1.96 / Math.sqrt(12 * n));
    const LS_mean = 0.5 + (1.96 / Math.sqrt(12 * n));
    const meanAccept = mean >= LI_mean && mean <= LS_mean;

    this.meanTest = { calculatedValue: mean, lowerLimit: LI_mean, upperLimit: LS_mean, passed: meanAccept };

    // Prueba de Varianza
    const variance = this.normalizedNumbers.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1);
    const expectedVar = 1 / 12;
    const sigma = Math.sqrt((2 * expectedVar * expectedVar) / (n - 1));
    const LI_var = expectedVar - (1.96 * sigma);
    const LS_var = expectedVar + (1.96 * sigma);
    const varAccept = variance >= LI_var && variance <= LS_var;

    this.varianceTest = { calculatedValue: variance, lowerLimit: LI_var, upperLimit: LS_var, passed: varAccept };

    // Prueba de Correlación
    let correlationSum = 0;
    for (let i = 0; i < n - 1; i++) {
      correlationSum += this.normalizedNumbers[i] * this.normalizedNumbers[i + 1];
    }
    const correlation = (correlationSum / (n - 1)) - Math.pow(mean, 2);
    const correlationStdError = 1 / Math.sqrt(12 * n);
    const LI_corr = -1.96 * correlationStdError;
    const LS_corr = 1.96 * correlationStdError;
    const correlationAccept = correlation >= LI_corr && correlation <= LS_corr;

    this.correlationTest = { calculatedValue: correlation, lowerLimit: LI_corr, upperLimit: LS_corr, passed: correlationAccept };

    // Resultado final
    this.validationApproved = meanAccept && varAccept && correlationAccept;
  }

  regenerate() {
    if (!this.validationApproved) {
      const multipliers = [5, 7, 11, 13, 17, 19, 21, 23, 27, 29];
      const increments = [1, 3, 5, 7, 11, 13, 15, 17, 19, 21];
      
      this.multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
      this.increment = increments[Math.floor(Math.random() * increments.length)];
      this.seed = Math.floor(Math.random() * (this.modulus - 1));
    }
    
    this.generateNumbers();
  }

  validateInputs(): boolean {
    if (!Number.isInteger(this.seed) || !Number.isInteger(this.multiplier) || 
        !Number.isInteger(this.increment) || !Number.isInteger(this.count)) {
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

  updateChart() {
    const scatterData = this.normalizedNumbers.map((value, index) => ({ x: index + 1, y: value }));
    this.chartOptions = { ...this.chartOptions, series: [{ name: 'Números Aleatorios', data: scatterData }] };
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

    this.chartOptions.series = [{ data: [] }];
  }

  getDisplayNumbers() {
    return this.normalizedNumbers.map((num, index) => ({
      xIndex: `X${index + 1}`,
      rIndex: `r${index + 1}`,
      original: this.generatedNumbers[index],
      normalized: num.toFixed(6)
    }));
  }
}