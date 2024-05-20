// Firebase JSON veri URL'si
var jsonURL = "https://ledyakma-beef4-default-rtdb.europe-west1.firebasedatabase.app/Sensor.json?auth=YOUR_AUTH_TOKEN";

initializeDefaultValues();

function initializeDefaultValues() {
    // Firebase JSON veri URL'sini güncelleyerek "buttonPressed", "heatMode" ve "coolMode" değerlerini başlangıçta ayarla
    var buttonPressedUpdateURL = jsonURL.replace("Sensor.json", "Sensor/buttonPressed.json") + "?auth=YOUR_AUTH_TOKEN";
    var heatModeUpdateURL = jsonURL.replace("Sensor.json", "Sensor/heatMode.json") + "?auth=YOUR_AUTH_TOKEN";
    var coolModeUpdateURL = jsonURL.replace("Sensor.json", "Sensor/coolMode.json") + "?auth=YOUR_AUTH_TOKEN";

    // Fetch API kullanarak değerleri başlangıçta ayarla
    Promise.all([
        fetch(buttonPressedUpdateURL, {
            method: 'PUT',
            body: JSON.stringify("off"), // buttonPressed başlangıçta off olarak ayarla
            headers: {
                'Content-Type': 'application/json'
            }
        }),
        fetch(heatModeUpdateURL, {
            method: 'PUT',
            body: JSON.stringify(0), // heatMode başlangıçta kapalı olarak ayarla
            headers: {
                'Content-Type': 'application/json'
            }
        }),
        fetch(coolModeUpdateURL, {
            method: 'PUT',
            body: JSON.stringify(0), // coolMode başlangıçta kapalı olarak ayarla
            headers: {
                'Content-Type': 'application/json'
            }
        })
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        console.log('Initial values updated:', data);
        // Başlangıç değerleri başarıyla ayarlandığında devam eden işlemleri başlat
        updateData(); // Verileri güncelleyerek sayfayı başlat
    })
    .catch(error => console.error('Initial values update failed:', error));
}

// HTML içindeki ilgili öğeleri seçme
var humidityText = document.getElementById("humidity-text");
var temperatureText = document.getElementById("temperature-text");
var humidityProgress = document.getElementById("humidity-progress");
var temperatureProgress = document.getElementById("temperature-progress");

// Tema değiştirme anahtarı öğelerini seçme
var themeSwitch = document.getElementById("theme-switch");
var sunIcon = document.querySelector(".sun-icon");
var moonIcon = document.querySelector(".moon-icon");

// Tema değiştirme anahtarının durumunu izleme
themeSwitch.addEventListener("change", toggleTheme);

// Sayfa yüklendiğinde varsayılan tema aydınlık olsun
toggleTheme();

// Tema değiştirme işlevi
function toggleTheme() {
    if (themeSwitch.checked) {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
    }
}

function updateData() {
    fetch(jsonURL)
        .then(response => response.json())
        .then(data => {
            humidityText.textContent = `Nem: ${data["humidity"]} %`;
            temperatureText.textContent = `Sıcaklık: ${data["temperature"]} °C`;

        // Nem ve sıcaklık değerlerine göre ilerleme çubuklarını güncelleme
        var humidityPercentage = parseFloat(data["humidity"]);
        var temperaturePercentage = parseFloat(data["temperature"]);

        // Nem çemberinin doluluğunu ayarla
        var humidityCircumference = parseFloat(humidityProgress.getAttribute("r")) * 2 * Math.PI;
        var humidityOffset = humidityCircumference * (1 - humidityPercentage / 100);
        humidityProgress.style.strokeDasharray = humidityCircumference;
        humidityProgress.style.strokeDashoffset = humidityOffset;

        // Sıcaklık çemberinin doluluğunu ayarla
        var temperatureCircumference = parseFloat(temperatureProgress.getAttribute("r")) * 2 * Math.PI;
        var temperatureOffset = temperatureCircumference * (1 - temperaturePercentage / 100);
        temperatureProgress.style.strokeDasharray = temperatureCircumference;
        temperatureProgress.style.strokeDashoffset = temperatureOffset;            

            var buttonPressed = data["buttonPressed"];
            var heatMode = data["heatMode"];
            var coolMode = data["coolMode"];
            var temperatureSetting = data["wantedTemp"];

            var fireAnimation = document.getElementById("fire-animation");

            // Toggle animations based on modes
            if (heatMode === 1) {
                fireAnimation.classList.add("active");
            } 
            else {
                fireAnimation.classList.remove("active");
            }
        

            if (buttonPressed === "off") {
                document.getElementById("current-mode").textContent = "Klima şu an kapalı.";
                // Firebase JSON veri URL'sini güncelleyerek wantedTemp değerini 24 olarak ayarla
                var updateURL = jsonURL.replace("Sensor.json", "Sensor/wantedTemp.json") + "?auth=YOUR_AUTH_TOKEN";
                fetch(updateURL, {
                    method: 'PUT',
                    body: JSON.stringify(24),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Wanted temperature updated to 24:', data);
                })
                .catch(error => console.error('Wanted temperature update failed:', error));
            } else {
                if (heatMode === 0 && coolMode === 0) {
                    document.getElementById("current-mode").textContent = `Klima şu an varsayılan 24 derece sıcaklıkta çalışmakta. Değiştirmek için lütfen mod ve sıcaklık seçiniz.`;
                } else if (heatMode === 1 && coolMode === 0) {
                    document.getElementById("current-mode").textContent = `Klima şu an sıcak modda ve ${temperatureSetting} derece sıcaklıkta çalışmakta.`;
                } else if (heatMode === 0 && coolMode === 1) {
                    document.getElementById("current-mode").textContent = `Klima şu an soğuk modda ve ${temperatureSetting} derece sıcaklıkta çalışmakta.`;
                }
            }
        })
        .catch(error => console.error('Veri alınamadı:', error));
}

// Sayfa yüklendiğinde ve her 5 saniyede bir verileri güncelle
updateData();
setInterval(updateData, 100); // 100 msde bir güncelle

// "onButton" adındaki butona tıklandığında JSON dosyasındaki "buttonPressed" özelliğini toggle yap
document.getElementById("onButton").addEventListener("click", function() {
    // Firebase JSON veri URL'sini güncelleyerek "buttonPressed" özelliğini al ve durumunu toggle yap
    var updateURL = jsonURL.replace("Sensor.json", "Sensor/buttonPressed.json") + "?auth=YOUR_AUTH_TOKEN";
    fetch(updateURL)
        .then(response => response.json())
        .then(data => {
            var newStatus = (data === "on") ? "off" : "on"; // Mevcut duruma bağlı olarak yeni durumu belirle

            // Butonun içeriğini mevcut duruma göre güncelle
            document.getElementById("onButton").textContent = (newStatus === "on") ? "Power ON" : " Power OFF";

            // Yeni durumu Firebase JSON veri URL'sine gönder
            fetch(updateURL, {
                method: 'PUT',
                body: JSON.stringify(newStatus),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Button pressed status updated:', data);
                // Eğer yeni durum "off" ise heatMode ve coolMode değerlerini sıfırla
                if (newStatus === "off") {
                    resetHeatAndCoolModes();
                }
            })
            .catch(error => console.error('Button pressed status update failed:', error));
        })
        .catch(error => console.error('Current button pressed status retrieval failed:', error));
});

// "heatMode" butonuna tıklandığında
document.getElementById("heatMode").addEventListener("click", function() {
    // Firebase JSON veri URL'sini güncelleyerek "buttonPressed" durumunu kontrol et
    var buttonPressedURL = jsonURL.replace("Sensor.json", "Sensor/buttonPressed.json") + "?auth=YOUR_AUTH_TOKEN";

    // Fetch API kullanarak "buttonPressed" durumunu al
    fetch(buttonPressedURL)
        .then(response => response.json())
        .then(buttonPressedStatus => {
            // Eğer buttonPressed off ise işlem yapma
            if (buttonPressedStatus === "off") {
                console.log("Button pressed off olduğu için işlem yapılamaz.");
                return;
            }

            // Eğer buttonPressed on ise devam et
            var heatModeUpdateURL = jsonURL.replace("Sensor.json", "Sensor/heatMode.json") + "?auth=YOUR_AUTH_TOKEN";
            var coolModeUpdateURL = jsonURL.replace("Sensor.json", "Sensor/coolMode.json") + "?auth=YOUR_AUTH_TOKEN";

            // Fetch API kullanarak "heatMode" ve "coolMode" değerlerini güncelle
            Promise.all([
                fetch(heatModeUpdateURL, {
                    method: 'PUT',
                    body: JSON.stringify(1), // Heat Mode'u açık olarak ayarla
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(coolModeUpdateURL, {
                    method: 'PUT',
                    body: JSON.stringify(0), // Cool Mode'u kapalı olarak ayarla
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ])
            .then(responses => Promise.all(responses.map(response => response.json())))
            .then(data => {
                console.log('Heat and cool modes updated:', data);
                // Pop-up gösterme fonksiyonunu çağırarak modalı aç
                showTemperaturePopup("Isıtma Modu", "Lütfen istediğiniz sıcaklık değerini girin:");
            })
            .catch(error => console.error('Heat and cool mode update failed:', error));
        })
        .catch(error => console.error('Button pressed status retrieval failed:', error));
});

// "coolMode" butonuna tıklandığında
document.getElementById("coolMode").addEventListener("click", function() {
    // Firebase JSON veri URL'sini güncelleyerek "buttonPressed" durumunu kontrol et
    var buttonPressedURL = jsonURL.replace("Sensor.json", "Sensor/buttonPressed.json") + "?auth=YOUR_AUTH_TOKEN";

    // Fetch API kullanarak "buttonPressed" durumunu al
    fetch(buttonPressedURL)
        .then(response => response.json())
        .then(buttonPressedStatus => {
            // Eğer buttonPressed off ise işlem yapma
            if (buttonPressedStatus === "off") {
                console.log("Button pressed off olduğu için işlem yapılamaz.");
                return;
            }

            // Eğer buttonPressed on ise devam et
            var heatModeUpdateURL = jsonURL.replace("Sensor.json", "Sensor/heatMode.json") + "?auth=YOUR_AUTH_TOKEN";
            var coolModeUpdateURL = jsonURL.replace("Sensor.json", "Sensor/coolMode.json") + "?auth=YOUR_AUTH_TOKEN";

            // Fetch API kullanarak "heatMode" ve "coolMode" değerlerini güncelle
            Promise.all([
                fetch(heatModeUpdateURL, {
                    method: 'PUT',
                    body: JSON.stringify(0), // Heat Mode'u kapalı olarak ayarla
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(coolModeUpdateURL, {
                    method: 'PUT',
                    body: JSON.stringify(1), // Cool Mode'u açık olarak ayarla
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ])
            .then(responses => Promise.all(responses.map(response => response.json())))
            .then(data => {
                console.log('Heat and cool modes updated:', data);
                // Pop-up gösterme fonksiyonunu çağırarak modalı aç
                showTemperaturePopup("Soğutma Modu", "Lütfen istediğiniz sıcaklık değerini girin:");
            })
            .catch(error => console.error('Heat and cool mode update failed:', error));
        })
        .catch(error => console.error('Button pressed status retrieval failed:', error));
});


// Pop-up gösterme fonksiyonu
function showTemperaturePopup(mode, message) {
    // Bootstrap modalını oluştur
    var modalContent = `
        <div class="modal" id="temperatureModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${mode}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                        <input type="number" id="temperatureInput" class="form-control" placeholder="Örn: 25" required>
                        <div id="modalAlert" class="alert alert-danger d-none" role="alert">Geçersiz bir sıcaklık değeri girdiniz. Lütfen 16 ile 30 derece arasında bir sayı girin.</div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Kapat</button>
                        <button type="button" class="btn btn-primary" onclick="saveTemperature()">Kaydet</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Modalı HTML'e ekleyelim
    var modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalContent;
    document.body.appendChild(modalContainer);

    // Bootstrap modalını etkinleştirelim
    var modal = $('#temperatureModal').modal('show');

    // Enter tuşuna basıldığında sıcaklık değerini kaydet
    modal.on('keypress', function (e) {
        if (e.which === 13) {
            saveTemperature();
        }
    });

    // Enter tuşuna basıldığında formun gönderilmesini engelleyelim
    modal.find('form').on('submit', function (e) {
        e.preventDefault();
    });
}

// Kullanıcının girdiği sıcaklık değerini kaydetme fonksiyonu
function saveTemperature() {
    var wantedTemp = document.getElementById("temperatureInput").value;
    var modalAlert = document.getElementById("modalAlert");

    // Girişin sıcaklık aralığına uygunluğunu kontrol et
    if (wantedTemp !== "" && !isNaN(parseFloat(wantedTemp))) {
        if (wantedTemp >= 16 && wantedTemp <= 30) {
            // Firebase JSON veri URL'sini güncelleyerek "wantedTemp" değerini kaydet
            var updateURL = jsonURL.replace("Sensor.json", "Sensor/wantedTemp.json") + "?auth=YOUR_AUTH_TOKEN";
            fetch(updateURL, {
                method: 'PUT',
                body: JSON.stringify(parseFloat(wantedTemp)),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Wanted temperature updated:', data);
                // Başarılı bir şekilde güncellendiğine dair kullanıcıyı modal içinde bilgilendir
                modalAlert.textContent = `İstenilen sıcaklık ${wantedTemp}°C olarak ayarlandı.`;
                modalAlert.classList.remove('d-none');
                // Sıcaklık güncellendikten sonra modalı kapat
                setTimeout(function                () {
                    $('#temperatureModal').modal('hide');
                }, 2000); // 2 saniye sonra modalı kapat
            })
            .catch(error => console.error('Wanted temperature update failed:', error));
        } else {
            // Kullanıcıya uygun aralıkta bir sıcaklık girmesi gerektiğini modal içinde belirt
            modalAlert.textContent = "Geçersiz bir sıcaklık değeri girdiniz. Lütfen 16 ile 30 derece arasında bir sayı girin.";
            modalAlert.classList.remove('d-none');
            restorePreviousTemperature(); // Geçerli sıcaklık değerini geri yükle
        }
    } else {
        // Kullanıcıya sayısal bir değer girmesi gerektiğini belirt
        modalAlert.textContent = "Lütfen geçerli bir sayı girin.";
        modalAlert.classList.remove('d-none');
        restorePreviousTemperature(); // Geçerli sıcaklık değerini geri yükle
    }
}

// Geçerli sıcaklık değerini geri yükleme fonksiyonu
function restorePreviousTemperature() {
    fetch(jsonURL)
        .then(response => response.json())
        .then(data => {
            // En son geçerli sıcaklık değerini al ve modal'da göster
            var previousTemp = data["wantedTemp"];
            document.getElementById("temperatureInput").value = previousTemp;
        })
        .catch(error => console.error('Previous temperature retrieval failed:', error));
}

// Heat Mode ve Cool Mode'u sıfırlama fonksiyonu
function resetHeatAndCoolModes() {
    var heatModeUpdateURL = jsonURL.replace("Sensor.json", "Sensor/heatMode.json") + "?auth=YOUR_AUTH_TOKEN";
    var coolModeUpdateURL = jsonURL.replace("Sensor.json", "Sensor/coolMode.json") + "?auth=YOUR_AUTH_TOKEN";

    // Fetch API kullanarak heatMode ve coolMode değerlerini sıfırla
    Promise.all([
        fetch(heatModeUpdateURL, {
            method: 'PUT',
            body: JSON.stringify(0), // Heat Mode'u kapalı olarak ayarla
            headers: {
                'Content-Type': 'application/json'
            }
        }),
        fetch(coolModeUpdateURL, {
            method: 'PUT',
            body: JSON.stringify(0), // Cool Mode'u kapalı olarak ayarla
            headers: {
                'Content-Type': 'application/json'
            }
        })
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        console.log('Heat and cool modes reset:', data);
    })
    .catch(error => console.error('Heat and cool modes reset failed:', error));
}

// "+" butonuna tıklandığında
document.getElementById("temp-up").addEventListener("click", function() {
    changeTemperature(true); // Sıcaklığı artırmak için fonksiyonu çağır
});

// "-" butonuna tıklandığında
document.getElementById("temp-down").addEventListener("click", function() {
    changeTemperature(false); // Sıcaklığı azaltmak için fonksiyonu çağır
});

// Sıcaklık değiştirme işlevi
function changeTemperature(increase) {
    fetch(jsonURL)
        .then(response => response.json())
        .then(data => {
            var currentTemp = parseFloat(data.wantedTemp);
            var buttonPressed = data.buttonPressed;

            // Arttırma veya azaltma işlemi sadece buttonPressed "on" iken yapılabilir
            if (buttonPressed === "on") {
                // Arttırma veya azaltma işlemi
                var newTemp = increase ? currentTemp + 1 : currentTemp - 1;

                // Sıcaklık aralığını kontrol et
                if (newTemp >= 16 && newTemp <= 30) {
                    // Firebase JSON veri URL'sini güncelleyerek "wantedTemp" değerini kaydet
                    var updateURL = jsonURL.replace("Sensor.json", "Sensor/wantedTemp.json") + "?auth=YOUR_AUTH_TOKEN";
                    fetch(updateURL, {
                        method: 'PUT',
                        body: JSON.stringify(newTemp),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            // Başarıyla güncellendiğinde kullanıcı arayüzünde göster
                            document.getElementById("wanted-temp").textContent = newTemp;
                            console.log('Wanted temperature updated:', newTemp);
                        } else {
                            console.error('Wanted temperature update failed:', response.status);
                        }
                    })
                    .catch(error => console.error('Wanted temperature update failed:', error));
                } else {
                    console.log('Sıcaklık aralığı 16 ile 30 derece arasında olmalıdır.');
                }
            } else {
                console.log('Klima kapalı olduğu için sıcaklık ayarı yapılamaz.');
            }
        })
        .catch(error => console.error('Current wanted temperature retrieval failed:', error));
}

