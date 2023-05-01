const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()

const imgUser = document.getElementById('user-img')
const btnLogin = document.getElementById('btn-login')
const btnLogout = document.getElementById('btn-logout')

btnLogin.onclick = () => auth.signInWithRedirect(provider)
btnLogout.onclick = logout

function logout() {
    firebase.auth().signOut().then(() => {
        imgUser.src = 'static/UserIcon.png'
        btnLogout.setAttribute('disabled', '')
        btnLogin.removeAttribute('disabled')
    }, function (error) {
        console.error('Sign Out Error', error)
    })
}