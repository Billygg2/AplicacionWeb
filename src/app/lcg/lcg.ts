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
  seed: number = 37;
  multiplier: number = 19;
  increment: number = 33;
  modulus: number = 100;
  count: number = 4;

  g: number = 0;  // Se calculará automáticamente
  period: number = 0; // N = m

  generatedNumbers: number[] = [];
  normalizedNumbers: number[] = [];

  chartOptions: any = {
    series: [{
      name: 'Números Aleatorios',
      data: []
    }],
    chart: {
      type: 'scatter',
      height: 350,
      zoom: { enabled: true }
    },
    xaxis: {
      title: { text: 'Índice' },
      tickAmount: 10
    },
    yaxis: {
      title: { text: 'Valor Normalizado' },
      min: 0,
      max: 1
    },
    colors: ['#3b82f6'],
    markers: {
      size: 6
    }
  };

  generateNumbers() {

    if (!this.validateInputs()) return;

    // === Cálculo automático ===
    this.g = Math.log2(this.modulus);
    this.period = this.modulus; // N = m

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
  }

  validateInputs(): boolean {
    if (
      this.seed <= 0 ||
      this.multiplier <= 0 ||
      this.increment <= 0 ||
      this.modulus <= 1 ||
      this.count <= 0
    ) {
      alert("Todos los parámetros deben ser mayores que 0.");
      return false;
    }

    // Validar que m sea potencia de 2
    if (Math.log2(this.modulus) % 1 !== 0) {
      alert("El módulo (m) debe ser potencia de 2 (por ejemplo: 8, 16, 32, 64, 128).");
      return false;
    }

    return true;
  }

  updateChart() {
    const scatterData = this.normalizedNumbers.map((value, index) => ({
      x: index + 1,
      y: value
    }));

    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        name: 'Números Aleatorios',
        data: scatterData
      }]
    };
  }

  reset() {
    this.seed = 37;
    this.multiplier = 19;
    this.increment = 33;
    this.modulus = 100;
    this.count = 4;
    this.g = 0;
    this.period = 0;

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
