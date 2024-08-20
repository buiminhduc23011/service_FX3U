const fs = require("fs");
const { MAC } = require('./configs');
const { dataController,plc_controller  } = require('./controller');
const { connect_socket, socket } = require('./Socket');
const { connect_plc, plc } = require('./PLC');
const { server, listen_tcp,clear_data, dataFrame } = require('./TCPServer');
const { reverseToString } = require('./Process_Data');
var assy_status = 0;
var drill_status = 0;
var flag_done = 0;

function logfile(message) {
  const timestamp = new Date().toLocaleString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    fs.writeFileSync("logfile.log", logMessage, { flag: 'a+' }); // 'a+' để append và tạo file nếu nó không tồn tại
  } catch (err) {
    console.error("Error writing to log file:", err);
  }
}
function CallFrame()
{
  if(dataFrame()!=null)
  {
    let dataString = dataFrame().toString();
    let data_ = dataString.split(" ");
    console.log(dataString);
    if (data_[0] == "BT:") {
      if (data_[1] != "NG") {
        frame_id_origin = data_[1];
        const data = { mac: MAC, frame_id: data_[1] };
        socket.emit('assy-send-frame_id', data);
        console.log("Gọi Rồi nè");
        logfile(JSON.stringify(data));
        clear_data();
      }
      else {
        const NG = { Cf_OK: 3 };
        plc_controller(plc, NG);
      }
    }
  }
  
}
function check_drill_status(drill_status_) {
  if (drill_status_ != drill_status) {
    if (drill_status_ == 0) {
      const data = { mac: MAC, data: true };
      socket.emit('assy-accpent_reset_drills', data);
      console.log('Reset Drill OK');
    }
    assy_status = assy_status_;
  }
}

function check_assy_status(assy_status_) {
  if (assy_status_ != assy_status) {
    const data = { mac: MAC, assy_status: assy_status_ };
    socket.emit('assy-status', data);
    console.log('emit status ok');
    assy_status = assy_status_;
  }
}
function check_done_frame(done_status, plc_data) {
  if (done_status == 1) {
    flag_done++;
    if (flag_done == 1) {
      logfile("Done_Frame");
      const data = {
        mac: MAC,
        frame_id: reverseToString(plc_data.O_FrameID),
        Ass_Height: plc_data.Value_Frame[0],
        Drill_Depth: plc_data.Value_Frame[1],
        Pin_Error: plc_data.Value_Frame[2],
        Status: plc_data.Status_Frame,
      };
      socket.emit('assy-success-production', data);
      logfile(JSON.stringify(data));
    }
  }
  else {
    flag_done = 0;
  }
}
// PLC_BT
async function read_plc() {
  try {
    const plcData = await dataController(plc);
    check_assy_status(plcData.assy_status);
    check_done_frame(plcData.DoneFrame, plcData);
    check_drill_status(plcData.StatusChangeDrill);
    CallFrame();
    //console.log(plcData);
  } catch (error) {
    console.error('Error reading PLC data:', error);
  }
}
async function main() {
  try {
    logfile("Server is start!");
    connect_plc();
    connect_socket();
    listen_tcp();

    setInterval(read_plc, 1000);
  } catch (error) {
    console.error('Error in main:', error);
  }
}
main();
