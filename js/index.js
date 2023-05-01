const list = document.getElementById('list-ads')

function listAds(array, elem) {
    elem.innerHTML = ''
    if (array.length === 0) {
        elem.innerHTML = `<li class="d-block"><h2>Nenhum anúncio encontrado</h2></li>`
    } else {
        array.forEach(ad => {
            const el = document.createElement('li')
            el.classList.value = 'd-block p-3 rounded border'
            const elData = `<h2>${ad.name}</h2>
            <div class="px-3 py-0 mb-2">
                <img src="${ad.photoURL}" alt="Imagem do anúncio" class="w-100 rounded shadow-sm" />
            </div>`
            el.innerHTML = elData
            const adData = `<details>
                <summary>Dados do anúncio</summary>
                <ul type="disc">
                    <li><strong>Id:</strong> ${ad.id}</li>
                    <li><strong>Email:</strong> ${ad.email}</li>
                    <li><strong>Link:</strong> ${ad.link}</li>
                    <li><strong>Local:</strong> ${ad.local}</li>
                    <li><strong>Páginas:</strong> ${ad.pages}</li>
                    <li><strong>Validade:</strong> ${ad.validity}</li>
                    <li><strong>Preço:</strong> ${ad.price}</li>
                </ul>
            </details>`
            el.innerHTML += adData
            const totalData = document.createElement('div')
            el.appendChild(totalData)

            const detailsByDay = document.createElement('details')
            const summaryByDay = document.createElement('summary')
            summaryByDay.innerHTML = 'Últimos 7 dias'
            const canvas = document.createElement('canvas')
            detailsByDay.appendChild(summaryByDay)
            detailsByDay.appendChild(canvas)
            el.appendChild(detailsByDay)

            db.collection(`statistics`).doc(ad.id).onSnapshot(doc => {
                const allStatistics = doc.data()
                const allStatisticsHtml = `<details>
                <summary>Todo período</summary>
                <ul type="disc">
                    <li><strong>Cliques:</strong> ${allStatistics.clicks}</li>
                    <li><strong>Visualizações:</strong> ${allStatistics.views}</li>
                    <li><strong>Impressões:</strong> ${allStatistics.prints}</li>
                </ul>
                </details>`
                totalData.innerHTML = allStatisticsHtml
            })

            let lastSevenDays = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - i);
                return date.toLocaleDateString()
            });
            lastSevenDays = lastSevenDays.reverse()

            let dataChart = {
                labels: ['Carregando', 'Carregando', 'Carregando', 'Carregando', 'Carregando', 'Carregando'],
                datasets: [{
                    label: 'data',
                    data: [0, 0, 0, 0, 0, 0],
                    borderWidth: 1
                }]
            }

            const chart = new Chart(canvas, {
                type: 'line',
                data: dataChart,
                options: {
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });

            db.collection(`statistics/${ad.id}/byDay`).onSnapshot(snapshot => {
                const data = snapshot.docs
                const dataByDays = [
                    {
                        label: 'Cliques',
                        data: [],
                        borderWidth: 1
                    },
                    {
                        label: 'Visualizações',
                        data: [],
                        borderWidth: 1
                    },
                    {
                        label: 'Impressões',
                        data: [],
                        borderWidth: 1
                    }
                ]
                lastSevenDays.forEach(day => {
                    day = formatDateString(day)
                    const docFiltered = data.filter(d => d.id === day)[0]?.data()
                    if (docFiltered) {
                        dataByDays[0].data.push(docFiltered.clicks)
                        dataByDays[1].data.push(docFiltered.views)
                        dataByDays[2].data.push(docFiltered.prints)
                    } else {
                        dataByDays[0].data.push(0)
                        dataByDays[1].data.push(0)
                        dataByDays[2].data.push(0)
                    }
                })
                dataChart.labels = lastSevenDays
                dataChart.datasets = dataByDays
                chart.update();
            })

            elem.appendChild(el)
        })
    }
}

function formatDateString(data) {
    var dia = parseInt(data.split("/")[0]);
    var mes = parseInt(data.split("/")[1]);
    var ano = parseInt(data.split("/")[2]);
    return `${mes}-${dia}-${ano}`
}

firebase.auth().onAuthStateChanged(async user => {
    if (user) {
        imgUser.src = user.photoURL
        btnLogin.setAttribute('disabled', '')
        btnLogout.removeAttribute('disabled')
    } else {
        btnLogout.setAttribute('disabled', '')
        btnLogin.removeAttribute('disabled')
    }

    if (auth.currentUser === null) {
        listAds([], list)
    } else {
        db.collection('anunciantes').onSnapshot(snapshot => {
            const docs = snapshot.docs.map(doc => doc.data())
            if (auth.currentUser?.email !== 'tvpovaoweb@gmail.com'
                || auth.currentUser?.email !== 'vanortton@gmail.com')
                docs.filter(ad => ad.email === auth.currentUser?.email)
            listAds(docs, list)
        })
    }
})