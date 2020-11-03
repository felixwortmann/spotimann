import ApiService from './ApiService'

const baseUrl = 'http://localhost:3001/'

class SongService extends ApiService {
  getAllSongs() {
    return this.authorizedRequest(baseUrl + 'songs').then(response => {
      return response.data
    })
  }
}

export default new SongService();