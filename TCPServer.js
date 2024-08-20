const fs = require("fs");
const net = require('net');
const { MAC } = require('./configs');
const { socket } = require('./Socket');
const { plc_controller } = require('./controller');
const { plc } = require('./PLC')
var frame_id_origin;
var FrameCall;
const server = net.createServer((tcp_server) => {
  console.log('Client connected');

  tcp_server.on('data', (data) => {
    FrameCall = data;
    let dataString = dataFrame().toString();
    let data_ = dataString.split(" ");
    if (data_[0] == "BT:") {
      if (data_[1] != "NG") {
        frame_id_origin = data_[1];
        console.log("Đang Đọc");
      }
    }

  });
  tcp_server.on('end', () => {
    console.log('Client disconnected');
  });
});
function clear_data() {
  FrameCall = null;
}
const dataFrame = () => {
  return FrameCall;
}
const dataFrameOrigin = () => {
  return frame_id_origin;
}
function listen_tcp() {
  server.listen(5000, () => {
    console.log('Server is listening on port 5000');
  });

}
function logfile(message) {
  const timestamp = new Date().toLocaleString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    fs.writeFileSync("call.log", logMessage, { flag: 'a+' }); // 'a+' để append và tạo file nếu nó không tồn tại
  } catch (err) {
    console.error("Error writing to log file:", err);
  }
}
module.exports = {
  server,
  frame_id_origin,
  listen_tcp,
  clear_data,
  dataFrame,
  dataFrameOrigin,
};