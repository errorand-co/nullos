const url = 'https://uogfcvyvtlmbswjqgbah.supabase.co/rest/v1/gsc_daily_data?select=*&user_id=eq.d71afaed-f998-4aaa-b050-dfe47f5074c3&order=date.desc&limit=5'
const res = await fetch(url, {
  headers: {
    apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvZ2Zjdnl2dGxtYnN3anFnYmFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkwMDMwNCwiZXhwIjoyMDk4NDc2MzA0fQ.Af9o597D-9UJVzbg-QWfJdCeU1SACfHoUL2-8qPWMoo',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvZ2Zjdnl2dGxtYnN3anFnYmFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkwMDMwNCwiZXhwIjoyMDk4NDc2MzA0fQ.Af9o597D-9UJVzbg-QWfJdCeU1SACfHoUL2-8qPWMoo'
  }
})
const data = await res.json()
console.log('Rows:', data.length, 'Sample:', JSON.stringify(data[0]))