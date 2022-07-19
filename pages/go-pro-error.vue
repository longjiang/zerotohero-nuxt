<router>
  {
    path: '/go-pro-error',
    props: true
  }
</router>
<template>
  <div class="main container mt-5 p-4 rounded shadow">
    <div class="row">
      <div class="col-sm-12">
        <div>
          <h3>Sorry, there was a problem.</h3>
          <p>
            There was a problem with your payment with our payment processor Stripe. If you need assistance, please contact us. Make sure to include the following information:
          </p>
          <div class="mt-3" />
          <p class="strong">👇 Include this in your email:</p>
          <div cols="30" rows="10" class="alert alert-warning p-3">{{ $route.query }}</div>
          <a href="mailto:jon.long@zerotohero.ca" class="btn btn-success">
            <i class="fas fa-paper-plane"></i> Email Support
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
</script>