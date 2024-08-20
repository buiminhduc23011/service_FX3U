var Res_PLC_BT = {
  I_FrameID: 'D1010,20',
  error_input_frame: 'D1030,1',
  O_FrameID: 'D910,20',
  Status_Frame: 'D930,1',
  Value_Frame: 'DFLOAT900,5',
  DoneFrame: 'D946,1',
  //
  Start_order: 'D90,1',
  cmd_agv_status: 'D991,1',
  last_order: 'D990,1',
  assy_status: 'D945,1',
  StatusChangeDrill: 'D746,1', // 1: IsChangeDrill 1; 2: IsChangeDrill 2
  ResetChangeDrill: 'D784,1', // 1: Reset Drill 1; 2: Reset: Reset Drill 2
  WaitCheck: 'D986,1', // 0: NoWait; 1:Wait
  //
  Cf_OK: 'D120,1' //1:NG,2:NG_Server,3:NG_Code
};
var MAC = "54:14:F3:08:02:CD";
module.exports = { Res_PLC_BT, MAC };
