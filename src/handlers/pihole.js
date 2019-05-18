import axios from 'axios'
import config from 'config'

const hole = axios.create({
  baseURL: `http://${config.get('pihole.host')}`,
  params: {
    auth: config.get('pihole.token')
  }
})

async function apiRequest (actionName, params = {}, method = 'get') {
  const result = await hole[method]('/admin/api.php', {
    params: {
      [actionName]: '',
      ...params
    }
  })

  return result.data
}

async function getQuerySources () {
  const clients = await apiRequest('getQuerySources', { topClients: 20 })

  return clients['top_sources']
}

export default {
  name: 'pihole',
  async collectState () {
    return {
      querySources: await getQuerySources()
    }
  }
}
