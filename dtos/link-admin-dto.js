module.exports = class LinkAdminDto {
  id;
  origin;
  fake;
  tag;
  status;
  visits;
  subscribers;
  successfullVisits;
  index;

  constructor(model) {
    this.id = model.id;
    this.origin = model.origin;
    this.fake = `${process.env.CLIENT_URL}/${model.id}`;
    this.tag = model.tag;
    this.status = model.status;
    this.visits = model.visits;
    this.subscribers = model.subscribers;
    this.successfullVisits = model.successfullVisits;
    this.index = model.serial_index;
  }
};
