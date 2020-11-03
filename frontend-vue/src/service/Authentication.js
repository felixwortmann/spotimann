import keycloak from 'keycloak-js'
import { reactive, ref } from 'vue'



class Authentication {
    // reactive state
    

    constructor() {
        this.state = reactive({
            loggedIn: ref(false),
            username: ref(undefined),
            name: ref(undefined)
        })

        this.instance = new keycloak();
        this.instance.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
          }).then((authenticated) => {
            this.authenticated = authenticated;
            if (authenticated) {
                this.loggedIn();
            }
            console.log(authenticated ? 'authenticated' : 'not authenticated');
        }).catch(function(error) {
            alert('Keycloak konnte nicht initialisiert werden. Fehlermeldung in der Konsole prüfen.');
            console.error(error);
        });
    }

    login() {
        this.instance.login().then((what) => {
            console.info("User Logged In", what);
            this.instance.loadUserInfo().then(console.log);
        });
    }

    logout() {
        this.instance.logout().then((what) => {
            console.info("User Logged Out", what);
        });
    }

    loggedIn() {
        this.instance.loadUserInfo().then((userInfo) => {
            this.state.loggedIn = true;
            this.state.username = userInfo.preferred_username;
            this.state.name = userInfo.given_name;
            console.log(userInfo);
            console.log(this.instance.token);
        });
    }

    getToken() {
        //this.instance.loadUserInfo().then(console.log);
    }
}

export default new Authentication();