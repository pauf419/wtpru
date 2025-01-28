from flask import Flask, request, jsonify
from pyrogram import raw
from pyrogram.utils import compute_password_check, compute_password_hash, btoi, itob
import os
import base64

app = Flask(__name__)

API_KEY = "__APIKEY__"

class Ch:
    def __init__(self, salt1=None, salt2=None, g=None, p=None):
        self.salt1 = salt1
        self.salt2 = salt2
        self.g = g
        self.p = p
class AlgorithmData:
    def __init__(self, new_algo):
        self.new_algo = new_algo

class Algorithm1Data:
    def __init__(self, new_algo, current_algo, srp_id, srp_B):
        self.new_algo = new_algo
        self.current_algo = current_algo
        self.srp_id = srp_id
        self.srp_B = srp_B

class Algorithm2Data:
    def __init__(self, current_algo, srp_id, srp_B):
        self.current_algo = current_algo
        self.srp_id = srp_id
        self.srp_B = srp_B


def check_api_key():
    api_key = request.headers.get("X-API-Key")
    if api_key != API_KEY:
        return jsonify({"error": "Unauthorized"}), 401

@app.before_request
def before_request():
    if request.endpoint not in ["public"]:
        error_response = check_api_key()
        if error_response:
            return error_response


@app.route("/gencrypto/2FA/enable", methods=["POST"])
def secure_data():
    base64_data = request.get_json().get('new_algo')
    password = request.get_json().get("password")

    try:
        ch = Ch(
            salt1=base64.b64decode(base64_data.get("salt1")),
            salt2=base64.b64decode(base64_data.get("salt2")),
            g=int(base64_data.get("g")),
            p=base64.b64decode(base64_data.get("p")),
        )
        r = AlgorithmData(
            ch
        )
    except Exception as e:
        print(e)
        return {"error": f"Failed to decode Base64: {e}"}, 400

    r.new_algo.salt1 += os.urandom(32)
    new_hash = btoi(compute_password_hash(r.new_algo, password))
    new_hash = itob(pow(r.new_algo.g, new_hash, btoi(r.new_algo.p)))

    print(new_hash)
    print("SUCCESS")
    return jsonify({
        "status": "Success",
        "result": {
            "new_algo": {
                "salt1": base64.b64encode(r.new_algo.salt1).decode('utf-8'),
                "salt2": base64.b64encode(r.new_algo.salt2).decode('utf-8'),
                "g": r.new_algo.g,
                "p": base64.b64encode(r.new_algo.p).decode('utf-8')
            },
            "new_password_hash": base64.b64encode(new_hash).decode('utf-8')
        }
    })
@app.route("/gencrypto/2FA/remove", methods=["POST"])
def dem():
    base64_current_algo = request.get_json().get('current_algo')
    current_password = request.get_json().get("current_password")
    base64_srp_B = request.get_json().get("srp_B")
    srp_id = request.get_json().get("srp_id")


    try:
        current_algo = Ch(
            salt1=base64.b64decode(base64_current_algo.get("salt1")),
            salt2=base64.b64decode(base64_current_algo.get("salt2")),
            g=int(base64_current_algo.get("g")),
            p=base64.b64decode(base64_current_algo.get("p")),
        )
        r = Algorithm2Data(
            current_algo,
            srp_id,
            base64.b64decode(base64_srp_B)
        )
    except Exception as e:
        print(e)
        return {"error": f"Failed to decode Base64: {e}"}, 400

    current_pass_hashed = compute_password_check(r, current_password)
    print(current_pass_hashed)
    print("SUCCESS")

    return jsonify({
        "status": "Success",
        "result": {
            "password": {
                "srp_id": current_pass_hashed.srp_id,
                "A": base64.b64encode(current_pass_hashed.A).decode('utf-8'),
                "M1": base64.b64encode(current_pass_hashed.M1).decode('utf-8')
            },
        }
    })
@app.route("/gencrypto/2FA/change", methods=["POST"])
def public():
    base64_new_algo = request.get_json().get('new_algo')
    base64_current_algo = request.get_json().get('current_algo')
    new_password = request.get_json().get("new_password")
    current_password = request.get_json().get("current_password")
    base64_srp_B = request.get_json().get("srp_B")
    srp_id = request.get_json().get("srp_id")


    try:
        new_algo = Ch(
            salt1=base64.b64decode(base64_new_algo.get("salt1")),
            salt2=base64.b64decode(base64_new_algo.get("salt2")),
            g=int(base64_new_algo.get("g")),
            p=base64.b64decode(base64_new_algo.get("p")),
        )
        current_algo = Ch(
            salt1=base64.b64decode(base64_current_algo.get("salt1")),
            salt2=base64.b64decode(base64_current_algo.get("salt2")),
            g=int(base64_current_algo.get("g")),
            p=base64.b64decode(base64_current_algo.get("p")),
        )
        r = Algorithm1Data(
            new_algo,
            current_algo,
            srp_id,
            base64.b64decode(base64_srp_B)
        )
    except Exception as e:
        print(e)
        return {"error": f"Failed to decode Base64: {e}"}, 400

    r.new_algo.salt1 += os.urandom(32)
    new_hash = btoi(compute_password_hash(r.new_algo, new_password))
    new_hash = itob(pow(r.new_algo.g, new_hash, btoi(r.new_algo.p)))

    current_pass_hashed = compute_password_check(r, current_password)

    print("SUCCESS")

    return jsonify({
        "status": "Success",
        "result": {
            "password": {
                "srp_id": current_pass_hashed.srp_id,
                "A": base64.b64encode(current_pass_hashed.A).decode('utf-8'),
                "M1": base64.b64encode(current_pass_hashed.M1).decode('utf-8')
            },
            "new_algo": {
                "salt1": base64.b64encode(r.new_algo.salt1).decode('utf-8'),
                "salt2": base64.b64encode(r.new_algo.salt2).decode('utf-8'),
                "g": r.new_algo.g,
                "p": base64.b64encode(r.new_algo.p).decode('utf-8')
            },
            "new_password_hash": base64.b64encode(new_hash).decode('utf-8')
        }
    })

if __name__ == "__main__":
    app.run(debug=True, port=8080)
