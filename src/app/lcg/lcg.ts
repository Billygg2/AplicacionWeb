// lcg.ts (componente Angular completo)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-lcg',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './lcg.html',
  styleUrl: './lcg.css',
})
export class Lcg {
  // Parámetros ingresados por el usuario
  seed: number = 37;         // X0
  multiplier: number = 19;   // a
  increment: number = 33;    // c
  count: number = 100;       // N (cantidad que el usuario quiere generar)

  // Calculados automáticamente
  g: number = 0;             // ceil(log2(N))
  modulus: number = 1;       // m = 2^g
  period: number = 1;        // N ciclo de vida = m

  // Resultados
  generatedNumbers: number[] = [];
  normalizedNumbers: number[] = [];

  chartOptions: any = {
    series: [{ name: 'Números Aleatorios', data: [] }],
    chart: { type: 'scatter', height: 350, zoom: { enabled: true } },
    xaxis: { title: { text: 'Índice' }, tickAmount: 10 },
    yaxis: { title: { text: 'Valor Normalizado' }, min: 0, max: 1 },
    colors: ['#3b82f6'],
    markers: { size: 6 }
  };

  // Genera N números usando m = 2^g donde g = ceil(log2(N))
  generateNumbers() {
    if (!this.validateInputs()) return;

    // Calculamos g y m a partir de la cantidad solicitada (N = count)
    this.g = Math.max(0, Math.ceil(Math.log2(Math.max(1, this.count))));
    this.modulus = Math.pow(2, this.g);
    this.period = this.modulus; // tiempo de vida (m)

    // Verificar semilla con respecto a m después de cálculo
    if (this.seed < 0 || this.seed >= this.modulus) {
      alert(`La semilla debe cumplir 0 ≤ semilla < ${this.modulus}. Ajusta la semilla o elige otra cantidad.`);
      return;
    }

    // Confirmación si se generan muchos números (opcional)
    if (this.count > 100) {
      const confirmed = confirm(`Vas a generar ${this.count} números (módulo utilizado = ${this.modulus}). ¿Continuar?`);
      if (!confirmed) return;
    }

    // Reiniciar arrays
    this.generatedNumbers = [];
    this.normalizedNumbers = [];

    let current = this.seed;

    for (let i = 0; i < this.count; i++) {
      current = (this.multiplier * current + this.increment) % this.modulus;
      const normalized = current / (this.modulus - 1); // r = X / (m - 1)

      this.generatedNumbers.push(current);
      this.normalizedNumbers.push(normalized);
    }

    this.updateChart();
  }

  validateInputs(): boolean {
    // Validaciones básicas
    if (!Number.isInteger(this.seed) || !Number.isInteger(this.multiplier) || !Number.isInteger(this.increment) || !Number.isInteger(this.count)) {
      alert('Todos los parámetros deben ser enteros.');
      return false;
    }

    if (this.count <= 0) {
      alert('La cantidad (N) debe ser mayor que 0.');
      return false;
    }

    if (this.multiplier <= 0) {
      alert('El multiplicador (a) debe ser mayor que 0.');
      return false;
    }

    if (this.increment < 0) {
      alert('El incremento (c) debe ser mayor o igual que 0.');
      return false;
    }

    // Nota: la validación de semilla vs módulo se hace después de calcular módulo en generateNumbers()
    return true;
  }

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

    this.chartOptions = {
      ...this.chartOptions,
      series: [{ name: 'Números Aleatorios', data: [] }]
    };
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
