function I(id) {
  return document.getElementById(id);
}
const meterBk = "#E0E0E0";
const dlColor = "#6060AA";
const ulColor = "#309030";
const pingColor = "#AA6060";
const jitColor = "#AA6060";
const progColor = "#EEEEEE";

//CODE FOR GAUGES
function drawMeter(c, amount, bk, fg, progress, prog) {
  const ctx = c.getContext("2d");
  const dp = window.devicePixelRatio || 1;
  const cw = c.clientWidth * dp;
  const ch = c.clientHeight * dp;
  const sizScale = ch * 0.0055;
  if (c.width == cw && c.height == ch) {
    ctx.clearRect(0, 0, cw, ch);
  } else {
    c.width = cw;
    c.height = ch;
  }
  ctx.beginPath();
  ctx.strokeStyle = bk;
  ctx.lineWidth = 16 * sizScale;
  ctx.arc(
    c.width / 2,
    c.height - 58 * sizScale,
    c.height / 1.8 - ctx.lineWidth,
    -Math.PI * 1.1,
    Math.PI * 0.1
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = fg;
  ctx.lineWidth = 16 * sizScale;
  ctx.arc(
    c.width / 2,
    c.height - 58 * sizScale,
    c.height / 1.8 - ctx.lineWidth,
    -Math.PI * 1.1,
    amount * Math.PI * 1.2 - Math.PI * 1.1
  );
  ctx.stroke();
  if (typeof progress !== "undefined") {
    ctx.fillStyle = prog;
    ctx.fillRect(
      c.width * 0.3,
      c.height - 16 * sizScale,
      c.width * 0.4 * progress,
      4 * sizScale
    );
  }
}

function mbpsToAmount(s) {
  return 1 - 1 / 1.3 ** Math.sqrt(s);
}

function msToAmount(s) {
  return 1 - 1 / 1.08 ** Math.sqrt(s);
}

//SPEEDTEST AND UI CODE
let w = null; //speedtest worker
let data = null; //data from worker
const testParameters = {
  telemetry_level: "basic"
  //Optional: add more test parameters here
};

function startStop() {
  if (w != null) {
    //speedtest is running, abort
    w.postMessage("abort");
    w = null;
    data = null;
    I("startStopBtn").className = "";
    initUI();
  } else {
    //test is not running, begin
    w = new Worker("speedtest_worker.min.js");
    w.postMessage(`start ${JSON.stringify(testParameters)}`);
    I("startStopBtn").className = "running";
    I("shareArea").style.display = "none";
    w.onmessage = e => {
      data = JSON.parse(e.data);
      const status = data.testState;
      if (status >= 4) {
        //test completed
        I("startStopBtn").className = "";
        w = null;
        updateUI(true);
        if (status == 4) {
          //if testId is present, show sharing panel, otherwise do nothing
          try {
            const testId = Number(data.testId);
            if (!isNaN(testId)) {
              const shareURL = `${window.location.href.substring(
                0,
                window.location.href.lastIndexOf("/")
              )}/results/?id=${testId}`;
              I("resultsImg").src = shareURL;
              I("resultsURL").value = shareURL;
              I("testId").innerHTML = testId;
              I("shareArea").style.display = "block";
            }
          } catch (e) {}
        }
      }
    };
  }
}
//this function reads the data sent back by the worker and updates the UI
function updateUI(forced) {
  if (!forced && (!data || !w)) return;
  const status = data.testState;
  I("ip").textContent = data.clientIp;
  I("dlText").textContent =
    status == 1 && data.dlStatus == 0 ? "..." : data.dlStatus;
  drawMeter(
    I("dlMeter"),
    mbpsToAmount(Number(data.dlStatus * (status == 1 ? oscillate() : 1))),
    meterBk,
    dlColor,
    Number(data.dlProgress),
    progColor
  );
  I("ulText").textContent =
    status == 3 && data.ulStatus == 0 ? "..." : data.ulStatus;
  drawMeter(
    I("ulMeter"),
    mbpsToAmount(Number(data.ulStatus * (status == 3 ? oscillate() : 1))),
    meterBk,
    ulColor,
    Number(data.ulProgress),
    progColor
  );
  I("pingText").textContent = data.pingStatus;
  drawMeter(
    I("pingMeter"),
    msToAmount(Number(data.pingStatus * (status == 2 ? oscillate() : 1))),
    meterBk,
    pingColor,
    Number(data.pingProgress),
    progColor
  );
  I("jitText").textContent = data.jitterStatus;
  drawMeter(
    I("jitMeter"),
    msToAmount(Number(data.jitterStatus * (status == 2 ? oscillate() : 1))),
    meterBk,
    jitColor,
    Number(data.pingProgress),
    progColor
  );
}

function oscillate() {
  return 1 + 0.02 * Math.sin(Date.now() / 100);
}
//poll the status from the worker (this will call updateUI)
setInterval(() => {
  if (w) w.postMessage("status");
}, 200);
//update the UI every frame
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  ((callback, element) => {
    setTimeout(callback, 1000 / 60);
  });

function frame() {
  requestAnimationFrame(frame);
  updateUI();
}
frame(); //start frame loop
//function to (re)initialize UI
function initUI() {
  drawMeter(I("dlMeter"), 0, meterBk, dlColor, 0);
  drawMeter(I("ulMeter"), 0, meterBk, ulColor, 0);
  drawMeter(I("pingMeter"), 0, meterBk, pingColor, 0);
  drawMeter(I("jitMeter"), 0, meterBk, jitColor, 0);
  I("dlText").textContent = "";
  I("ulText").textContent = "";
  I("pingText").textContent = "";
  I("jitText").textContent = "";
  I("ip").textContent = "";
}
