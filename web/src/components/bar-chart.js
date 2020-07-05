import { Bar, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

export default {
  name: 'MyBarChart',
  extends: Bar,
  mixins: [reactiveProp],
  props: ['options'],
  watch: {
    chartData: (newVal, oldVal) => {
      // watch it
      console.log('Prop changed: ', newVal, ' | was: ', oldVal);
    }
  },
  mounted() {
    this.renderChart(this.chartData, this.options);
  }
};
