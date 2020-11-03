import axios from 'axios'
import Authentication from './Authentication'

export default class ApiService {
  authorizedRequest(url, options = {}) {
    return Authentication.getToken().then(token => {
      options.headers = {
        Authorization: 'Bearer ' + token
      }
      return axios.get(url, options)
    })
  }
}