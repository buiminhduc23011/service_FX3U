const fs = require("fs");
const io = require('socket.io-client');
const socket = io("http://172.21.80.47:4002"); //Server SHIV
//const socket = io("http://127.0.0.1:4000"); //Server Loccal
const { plc_controller } = require('./controller');
const { plc } = require('./PLC')
const { convertString } = require('./Process_Data');
const { dataFrameOrigin } = require('./TCPServer')
socket.on("connect", () => {
    console.log('Connected');
});
//
socket.on('assy-start-order', (data) => {
    console.log('assy-start-order:', data);
    const data_ = { Start_order: data.status }
    plc_controller(plc, data_);
});
socket.on('cmd-agv-status', (data) => {
    console.log('cmd-agv-status:', data);
    const data_ = { cmd_agv_status: data.cmd_agv_status }
    plc_controller(plc, data_);
});
socket.on('assy-send-frame_id', (data) => {
    const status = data.status;
    if (status == true) {
        const data_ = data.data;
        if (dataFrameOrigin() == data_.frame_origin_id) {
            const order = { I_FrameID: convertString(data_.frame_id, data_.frame_id.length), Cf_OK: 1 };
            plc_controller(plc, order);
        }
        const data_in = {FrameOriginSend: frame_id_origin, FrameOriginRev: data_.frame_origin_id,FrameIn: data_.frame_id};
        logfile(JSON.stringify(data_in));
    }
    else {
        const data_ = { error_input_frame: 1, Cf_OK: 2 };
        plc_controller(plc, data_);
    }
});
socket.on('assy-success-production', (data) => {
    //const status = data.status;
    const last_order = data.last_order;
    logfile("Đã ghi nhận sản phẩm");
    console.log('assy-success-production:', data);
    if (last_order == true) {
        const data_ = { last_order: 1 };
        plc_controller(plc, data_);
        logfile("Đã xong order");
    }

});
// Reset Drill
socket.on('reset-drills', (data) => {
    const qty = data.qty;
    if (qty > 0) {
        //const resetdrill = { ResetChangeDrill: qty };
        //plc_controller(plc, resetdrill);
    }
});
// Wait Check
socket.on('wait-check', (data) => {
    const wait = { WaitCheck: 1 };
    plc_controller(plc, wait);
    logfile("Đợi Bố Mày Check 1 tý");
});
//Done Check
socket.on('check-done', (data) => {
    const wait = { WaitCheck: 0, last_order: 1 };
    plc_controller(plc, wait);
    logfile("Tao Check Xong Rồi");
});
socket.on('close', () => {
    console.log('Socket connection closed');
});

socket.on('error', (err) => {
    console.error('Socket error:', err);
});

function connect_socket() {
    socket.connect(() => {
    });
}
function logfile(message) {
    const timestamp = new Date().toLocaleString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        fs.writeFileSync("success.log", logMessage, { flag: 'a+' }); // 'a+' để append và tạo file nếu nó không tồn tại
    } catch (err) {
        console.error("Error writing to log file:", err);
    }
}
module.exports = {
    connect_socket,
    socket,
};
