// Função para iniciar o jogo
function startGame() {
  // Substitui o botão Iniciar jogo por uma contagem regressiva e depois cria um botão para chamar a promessa player
  const gameContainer = document.getElementById("game-container");
  const startButton = document.getElementById("start-game");
  const playerButton = document.getElementById("play-music");
  const lblResposta = document.getElementById("lbl-resposta");
  const resposta = document.getElementById("resposta");
  const btnResposta = document.getElementById("btn-resposta");
  const musicControlsContainer = document.getElementById("music-controls-container");
  const pontuacaoContainer = document.getElementById("pontuacao-container");
  startButton.remove();
  const countdown = document.createElement("h1");
  countdown.innerText = "3";
  gameContainer.appendChild(countdown);
  setTimeout(() => {
    countdown.innerText = "2";
    setTimeout(() => {
      countdown.innerText = "1";
      setTimeout(() => {
        countdown.remove();
        playerButton.classList.remove("hidden");
        resposta.classList.remove("hidden");
        lblResposta.classList.remove("hidden");
        btnResposta.classList.remove("hidden");
        musicControlsContainer.classList.remove("hidden");
        pontuacaoContainer.classList.remove("hidden");
      }, 1000);
    }, 1000);
  }, 1000);
}

let pontuacao = -1;
let fimDeJogo = 0;
let player;
let trackName;
let playButtonPressCount = 0; // Contador de pressões do botão "play"
let lastTrackName = ""; // Variável para armazenar o nome da última música tocada

function score() {
  const pontuacaoElement = document.getElementById("pontuacao");
  pontuacaoElement.textContent = `Pontuação: ${pontuacao}`;
}
pontuacao++;
score();

window.onSpotifyWebPlaybackSDKReady = () => {
  // Trocar o token abaixo a cada hora, precisa estar logado, através do link https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started
  const token = "BQAHEsY2V5a-etpPQRomfIRkg1ErykFazudg7OaK1tdaYCHSijz3bbTUokxHSs7Lw_p4a4SeF5sX9Bp3ZLMygEcYAMSNgW2HxEKnpPzH3Jyr2MVDviv7EVngPo4MRQotIW8UJoG5AdolUqdVJhtZ8q7F9xNn3-hlVroM8TIXCPTah2UzXUWbFnDZv2-vvxSvShT6WWJZoaVqBTMid1-VMHok88PJ";
  player = new Spotify.Player({
    name: "Web Playback SDK Quick Start Player",
    getOAuthToken: (cb) => {
      cb(token);
    },
    volume: 0.5,
  });
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    const connect_to_device = () => {
      let album_uri = "spotify:album:18HaPkTt6Ez7yKgjJ3wRht";
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
        method: "PUT",
        body: JSON.stringify({
          context_uri: album_uri,
          play: false,
        }),
        headers: new Headers({
          "Authorization": "Bearer " + token,
        }),
      }).then(response => console.log(response))
        .then(data => {
          // Adicionar listener para o evento de mudança de estado de reprodução
          player.addListener('player_state_changed', ({
            track_window
          }) => {
            trackName = track_window.current_track.name;
            trackName = trackName.toLowerCase();
            console.log('Current Track:', trackName);

            if (trackName !== lastTrackName) {
              // Se a música mudou, reinicie o contador de pressões do botão "play"
              playButtonPressCount = 0;
              lastTrackName = trackName;
            }
          });
        });
    };
    connect_to_device();
  });

  // Botão play music para tocar a música por 13 segundos
  document.getElementById("play-music").addEventListener('click', () => {
    if (playButtonPressCount >= 2) {
      // Deduz 2 pontos se o botão "play" for pressionado mais de duas vezes
      pontuacao = Math.max( pontuacao - 2);
      score();
    }
    playButtonPressCount++; // Incrementa o contador de pressões do botão "play"

    player.togglePlay();
    setTimeout(() => {
      player.pause();
    }, 13000);
  });

  // Botão resposta para verificar se a resposta está correta, apagar a resposta e mudar a música do play-music para a próxima
  document.getElementById("btn-resposta").addEventListener('click', (event) => {
    event.preventDefault();
    let resposta = document.getElementById("resposta").value;
    resposta = resposta.toLowerCase();
    if (resposta == trackName) {
      alert("Você Acertou, Parabéns!");
      pontuacao += 10;
    } else {
      pontuacao = Math.max(-100, pontuacao - 5);
      fimDeJogo++;
      alert("Você errou, tente novamente!");
    }
    if (fimDeJogo >= 3) {
      pontuacao = 0;
      alert("FIM DE JOGO!");
      window.open('index.html');
    }

    document.getElementById("resposta").value = "";
    player.nextTrack();
    setTimeout(() => {
      player.pause();
    }, 1300);

    score();
  });

  player.connect();
};


