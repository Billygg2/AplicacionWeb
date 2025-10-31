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
  // Parámetros LCG
  seed: number = 123;
  multiplier: number = 1664525;
  increment: number = 1013904223;
  modulus: number = Math.pow(2, 32);
  count: number = 50;

  // Resultados
  generatedNumbers: number[] = [];
  normalizedNumbers: number[] = [];

  // Configuración del gráfico
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

  // Generar números aleatorios
  generateNumbers() {
    // Validaciones
    if (!this.validateInputs()) return;

    // Confirmación para más de 100 números
    if (this.count > 100) {
      const confirmed = confirm(`¿Estás seguro de generar ${this.count} números?`);
      if (!confirmed) return;
    }

    this.generatedNumbers = [];
    this.normalizedNumbers = [];

    let current = this.seed;

    for (let i = 0; i < this.count; i++) {
      // LCG: Xₖ₊₁ = (a * Xₖ + c) mod m
      current = (this.multiplier * current + this.increment) % this.modulus;
      const normalized = current / this.modulus;

      this.generatedNumbers.push(current);
      this.normalizedNumbers.push(normalized);
    }

    this.updateChart();
  }

  // Validar entradas
  validateInputs(): boolean {
    // Verificar que todos sean enteros
    if (!Number.isInteger(this.seed) || !Number.isInteger(this.multiplier) ||
      !Number.isInteger(this.increment) || !Number.isInteger(this.modulus) ||
      !Number.isInteger(this.count)) {
      alert('Todos los parámetros deben ser números enteros');
      return false;
    }

    // Verificar módulo > 1
    if (this.modulus <= 1) {
      alert('El módulo debe ser mayor que 1');
      return false;
    }

    // Verificar semilla en rango [0, módulo)
    if (this.seed < 0 || this.seed >= this.modulus) {
      alert(`La semilla debe estar en el rango: 0 ≤ semilla < ${this.modulus}`);
      return false;
    }

    // Verificar count positivo
    if (this.count <= 0) {
      alert('La cantidad de números debe ser mayor que 0');
      return false;
    }

    return true;
  }

  // Actualizar gráfico
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

  // Reiniciar todo
  reset() {
    this.seed = 123;
    this.multiplier = 1664525;
    this.increment = 1013904223;
    this.modulus = Math.pow(2, 32);
    this.count = 50;
    this.generatedNumbers = [];
    this.normalizedNumbers = [];

    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        name: 'Números Aleatorios',
        data: []
      }]
    };
  }

  // Obtener números para mostrar
  getDisplayNumbers() {
    return this.normalizedNumbers.map((num, index) => ({
      index: index + 1,
      original: this.generatedNumbers[index],
      normalized: num.toFixed(6)
    }));
  }
}