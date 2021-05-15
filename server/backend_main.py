# File: package_main.py
# entry point of Evidente backend
# Written by Sophie Pesch 2021

from os import abort
from backend_prepare_data import prepare_data, read_file_content
from flask import Flask, request, session
from markupsafe import escape
import sys


# we are using flask for RESTful communication
app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


@app.route('/api/upload', methods=['POST'])
def upload_data():
    """Parses data uploaded by frontend, invokes classico and returns result"""

    # noinspection PyPep8,PyBroadException
    try:
        nwk_data, snp_data, taxainfo_data, taxainfo_sep = read_file_content()
        # you may use the following lines to store data in session
        # (using cookies):
        # session['nwk'] = nwk_data
        # session['snp'] = snp_data
        # session['taxainfo'] = taxainfo_data
        return prepare_data(nwk_data, snp_data, taxainfo_data, taxainfo_sep)

    except ValueError as e:
        print("error", e.args)
        abort(500)
        # return redirect(request.url)

    except:
        print("Unexpected error:", sys.exc_info())
        abort(500)


@app.route('/api/statistics-request', methods=['POST'])
def prepare_statistics_data():
    """Parses data sent by frontend, computes statistics and returns result"""

    # noinspection PyPep8,PyBroadException
    try:
        print("in prepare_statistics_data")
        # todo! all data must be given in input
        # nwk = session.get('nwk')
        # return compute_statistics(nwk_data, snp_data, taxainfo_data)
        abort(501)
    except ValueError as e:
        print("error ", e.args)
        abort(500)
    except:
        print("Unexpected error:", sys.exc_info()[0])
        abort(500)


# just for debugging purposes:
@app.route('/<path:subpath>', methods=['POST'])
def show_post_subpath(subpath):
    """shows content of POST message"""

    # noinspection PyPep8,PyBroadException
    try:
        print('POST Subpath=%s' % escape(subpath))
        print(request.values)
        print(request.files)
        print(session)
        abort(501)
    except ValueError as e:
        print("error ", e.args)
        abort(500)
    except:
        abort(500)


@app.route('/<path:subpath>', methods=['GET'])
def show_get_subpath(subpath):
    """shows the content of GET message"""

    print('Subpath %s' % escape(subpath))
    print(session)
    abort(501)


if __name__ == "__main__":
    app.run(port=int("3001"))
