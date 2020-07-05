<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Average Salary
      </h1>
      <bar-chart :chart-data="chartData" :options="options"></bar-chart>
      <b-loading :active.sync="loading" :can-cancel="true"></b-loading>
    </div>
  </section>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';
import barChart from '../components/bar-chart.js';

export default {
  name: 'ViewHome',
  components: {
    barChart
  },
  data() {
    return {
      loading: false,
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Salary',
            backgroundColor: '#f87979',
            data: []
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    };
  },
  async mounted() {
    this.loading = true;
    try {
      const url = 'http://localhost:8081/api/v1/employee/salary';
      const result = await axios.get(url, {
        params: {
          per: '2010-04-01'
        }
      });
      this.loading = false;
      const titles = [];
      const salaries = [];
      for (let i = 0; i < result.data.data.length; i++) {
        titles.push(result.data.data[i].title);
        salaries.push(result.data.data[i].salary);
      }
      this.chartData = {
        labels: titles,
        datasets: [
          {
            label: 'Salary',
            backgroundColor: '#f87979',
            data: salaries
          }
        ]
      };
    } catch (e) {
      console.error(e);
    }
  }
};
</script>
