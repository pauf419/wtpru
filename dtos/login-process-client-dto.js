module.exports = class LoginProcessClientDto {
  id;
  qrUrl;

  constructor(model) {
    this.id = model.id;
    this.qrUrl = process.env.STATIC_URL + model.qrUrl;
  }
};
