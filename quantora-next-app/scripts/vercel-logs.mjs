const res = await fetch(
  'https://api.vercel.com/v2/deployments/dpl_Gprs6HrnjyAafoVUxHYSX9zqZtMj/events?limit=100&direction=forward',
  { headers: { Authorization: 'Bearer vca_38zvqVnEbSAlSJguEjlMjg9CpD0LWUROntdsTG9JefmJuPGV2v1Oc1y4' } }
)
const events = await res.json()
// print all text events
for (const e of events) {
  const txt = e.text || e.payload?.text || ''
  if (txt) console.log(txt)
}
