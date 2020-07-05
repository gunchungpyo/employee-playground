<template>
  <div class="section">
    <div class="container">
      <h1 class="title">
        Bull Jobs
      </h1>
      <b-loading :active.sync="loading" :can-cancel="true"></b-loading>

      <div class="buttons">
        <button class="button" @click="fetchJobs()">Refresh</button>
        <button class="button is-info" @click="submitJobs()">Rerun</button>
      </div>
      <div class="table-container">
        <table class="table">
          <!-- Your table content -->
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Data</th>
              <th>Created On</th>
              <th>Processed On</th>
              <th>Finished On</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.id">
              <td>{{ job.id }}</td>
              <td>
                <pre>{{ job.data }}</pre>
              </td>
              <td>{{ formatDate(job.timestamp) }}</td>
              <td>{{ formatDate(job.processedOn) }}</td>
              <td>{{ formatDate(job.finishedOn) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ToastProgrammatic as Toast } from 'buefy';

export default {
  name: 'ViewJobs',
  data() {
    return {
      jobs: [],
      loading: false
    };
  },
  created() {
    this.fetchJobs();
  },
  methods: {
    async fetchJobs() {
      this.loading = true;
      try {
        const url = 'http://localhost:8081/api/v1/queue';
        const result = await axios.get(url);
        this.loading = false;
        this.jobs = result.data.data;
      } catch (error) {
        console.log('error', error);
      }
    },
    async submitJobs() {
      try {
        const url = 'http://localhost:8081/api/v1/queue';
        const body = {
          start: '2010-01-01',
          end: '2010-03-31'
        };
        await axios.post(url, body);
        Toast.open('Submitted!');
      } catch (error) {
        Toast.open('Ops something went wrong');
      }
    },
    formatDate(timestamp) {
      if (timestamp == null) {
        return '';
      }
      const date = new Date(timestamp);
      return date.toLocaleString();
    }
  }
};
</script>
