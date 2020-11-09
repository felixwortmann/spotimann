import axios from 'axios'
import Authentication from './Authentication'

export default class ApiService {
  authorizedRequest(url) {
    return Authentication.getToken().then(token => {
      let options = {
        headers: {
          Authorization: 'Bearer ' + token
        }
      }
      return axios.get(url, options)
    })
  }
  authorizedPost(url, data) {
    return Authentication.getToken().then(token => {
      let options = {
        headers: {
          Authorization: 'Bearer ' + token
        }
      }
      return axios.post(url, data, options)
    })
  }
}