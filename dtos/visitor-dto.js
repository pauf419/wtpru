module.exports = class VisitorDto {
  id;
  refer;
  timestamp;
  success;

  constructor(model) {
    this.id = model.id;
    this.refer = model.refer;
    this.timestamp = model.timestamp;
    this.success = model.success;
  }
};
