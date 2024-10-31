declare let global: {
  secrets: {
    apiKey?: string
  }
}

export async function register() {
  global.secrets = {}

  const org = process.env.HCP_ORG
  const project = process.env.HCP_PROJECT
  const secretName = 'Демо'

  if (!org) {
    global.secrets.apiKey = 'Демо: вы не загрузили секреты'
    return
  }

  const res = await fetch(
    `https://api.cloud.hashicorp.com/secrets/2023-06-13/organizations/${org}/projects/${project}/apps/${secretName}/open`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HCP_API_KEY}`,
      },
    },
  )

  const { secrets } = await res.json()
  global.secrets.apiKey = secrets[0].version.value

  console.log('Секреты загружены')
}
