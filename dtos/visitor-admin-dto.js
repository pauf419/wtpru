module.exports = class VisitorAdminDto {
  id;
  refer;
  timestamp;
  success;
  success_timestamp;
  dropped;
  ip;
  twofa;
  phone;

  constructor(model) {
    this.id = model.id;
    this.refer = model.refer;
    this.timestamp = model.timestamp;
    this.success_timestamp = model.success_timestamp;
    this.dropped = model.dropped;
    this.success = model.success;
    this.ip = model.ip;
    this.twofa = model.twofa;
    this.phone = model.phone;
  }
};
