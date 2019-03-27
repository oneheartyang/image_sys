from flask import Flask, render_template, jsonify, make_response, request
import os
import base64
import re
import time
import socket

app = Flask(__name__)

basedir = os.path.dirname(__file__)
resource_dir_path = os.path.join(basedir, 'resource')
tmp_dir_path = os.path.join(basedir, 'tmp')

udp_conf = {
    'ip': '127.0.0.1',
    'port': 18888
}


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/index')
def login():
    return render_template('index.html')


@app.route('/h5')
def h5():
    return render_template('h5.html')


@app.route('/h5_1')
def h5_1():
    return render_template('h5_1.html')


@app.route('/demo')
def demo():
    return render_template('demo.html')


@app.route('/base64')
def base64_1():
    return render_template('base64.html')


@app.route('/uploadImage', methods=['GET', 'POST'])
def uploadImage():
    if request.method in ['GET', 'DELETE']:
        param_dict = request.args.to_dict()
    else:
        # 取表单中的数据
        param_dict = request.form.to_dict()
        if not param_dict:
            # 取json数据 Content-Type=application/json
            param_dict = request.json

    image = param_dict.get('imgDatadahe')
    strs = re.match('^data:image/(jpeg|png|gif);base64,', image)
    suffix = strs.groups()[0]

    image = image.replace(strs.group(), '')
    imgdata = base64.b64decode(image)

    a, b = str(time.time()).split(".")
    file_path = os.path.join(tmp_dir_path, a + '.png')
    print("uploadImage file_path:", file_path)

    with open(file_path, 'wb') as f:
        f.write(imgdata)

    image_addr = send_udp_socker(udp_conf.get('ip'), int(udp_conf.get('port')), file_path)
    print("send_udp_socker image_addr:",image_addr)

    with open(image_addr, "rb") as f:
        base64_data = base64.b64encode(f.read())

    png_base64_data = "data:image/jpg;base64,{0}".format(str(base64_data, encoding='utf-8'))

    response = {
        "code": 0,
        "msg": "success",
        "png_base64_data": png_base64_data
    }
    return jsonify(response)


@app.route('/send_data', methods=[ 'POST'])
def send_data():
    # 取表单中的数据
    param_dict = request.form.to_dict()
    if not param_dict:
        # 取json数据 Content-Type=application/json
        param_dict = request.json

    image = param_dict.get('imgDatadahe')
    strs = re.match('^data:image/(jpeg|png|gif);base64,', image)
    suffix = strs.groups()[0]

    image = image.replace(strs.group(), '')
    imgdata = base64.b64decode(image)

    a, b = str(time.time()).split(".")
    file_path = os.path.join(resource_dir_path, a + '.png')
    print("send_data file_path:", file_path)

    with open(file_path, 'wb') as f:
        f.write(imgdata)

    # todo 发送合成的图片
    # result = send_udp_socker(udp_conf.get('ip'), int(udp_conf.get('port')), file_path)

    response = {
        "code": 0,
        "msg": "success"
    }
    return jsonify(response)


def send_udp_socker(ip, port, data, need_result=True):
    """
    发送一个 udp 协议数据
    :param data:
    """
    data_bytes = bytes(data, 'utf-8')
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.sendto(data_bytes, (udp_conf.get('ip'), int(udp_conf.get('port'))))
    print('sendto ip:{0}:{1}. data:{2}'.format(udp_conf.get('ip'), udp_conf.get('port'), data_bytes))
    if need_result:
        result = s.recv(1024).decode('utf-8')
        return result
    else:
        return ""


@app.after_request
def af_request(resp):
    """
    #请求钩子，在所有的请求发生后执行，加入headers。
    :param resp:
    :return:
    """
    resp = make_response(resp)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST'
    resp.headers['Access-Control-Allow-Headers'] = 'x-requested-with,content-type'
    return resp


if __name__ == '__main__':
    app.run('0.0.0.0', 9905)
