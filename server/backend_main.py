# File: backend_main.py
# entry point of Evidente backend
# Written by Sophie Pesch 2021

from os import abort
from time import perf_counter,sleep
from backend_prepare_data import prepare_data, read_file_content
from backend_prepare_statistics import read_statistic_file_content, prepare_statistics
from backend_compute_statistics import go_enrichment, tree_enrichment
from flask import Flask, request, session, jsonify
from markupsafe import escape
import sys


# we are using flask for RESTful communication
app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


@app.route('/api/upload', methods=['POST'])
def upload_data():
    """Parses data uploaded by frontend, invokes classico and
    sends result to client.

    :return: Preprocessed phylogenetic data as :type JSON-object
    """

    # noinspection PyPep8,PyBroadException
    print(request.files)
    try:
        nwk_data, snp_data, taxainfo_data, taxainfo_sep = read_file_content()
        # you may use the following lines to store data in session
        # (using cookies):
        # session['nwk'] = nwk_data
        # session['snp'] = snp_data
        # session['taxainfo'] = taxainfo_data
        response = prepare_data(nwk_data, snp_data, taxainfo_data, taxainfo_sep)
        print(response)
        return response #prepare_data(nwk_data, snp_data, taxainfo_data, taxainfo_sep)

    except ValueError as e:
        print("error", e.args)
        return jsonify({'error' : 'internal server error'}), 500
        # return redirect(request.url)

    except:
        print("Unexpected error:", sys.exc_info())
        return jsonify({'error' : 'internal server error'}), 500

@app.route('/api/init-example', methods=['POST'])
def load_init_example():
    """ Loads files evidente-start example from directory, parsed data,
     invokes classico and sends result to client.
    :return: preprocessed phylogenetic data as :type Json-object
    """
    try:
        nwk_data =bytes( open("./MiniExample/mini_nwk.nwk", "r").read(), 'utf-8')
        #print(nwk_data)
        snp_data = bytes(open("./MiniExample/mini_snp.tsv", "r").read(),'utf-8')
        taxainfo_data = bytes(open("./MiniExample/mini_nodeinfo.csv", "r").read(),'utf-8')
        return prepare_data(nwk_data, snp_data, taxainfo_data, ",")
    except ValueError as e:
        print("error", e.args)
        return jsonify({'error': 'internal server error'}), 500


@app.route('/api/statistic-upload', methods=['POST'])
def prepare_statistics_data():
    """Parses data sent by frontend, prepares statistical data and
    sends result to client.

    :return: preprocessed statistical data as :type JSON-object
    """
    try:
        #print("in prepare_statistics_data")
        #start = perf_counter()

        go_data,go_sep,snp_info_data,snp_sep,gff_data,gff_sep,available_snps = read_statistic_file_content()
        response = prepare_statistics(gff_data.decode('utf8'),gff_sep,snp_info_data.decode('utf-8'),snp_sep,go_data.decode('utf-8'),go_sep,available_snps)
        #end = perf_counter()
        #time_needed = end - start
        #print(f"Needed {time_needed:0.4f} seconds for statistics data preparation")
        return response

    except ValueError as e:
        print("error ", e.args)
        return jsonify({'error': 'internal server error'}), 500

    except:
        print("Unexpected error:", sys.exc_info()[0])
        return jsonify({'error': 'internal server error'}), 500


@app.route('/api/statistics-request', methods=['POST'])
def compute_statistics():
    """Parses data sent by frontend,  computes go-enrichment and
    sends result to client.

    :return: go_enrichment result as :type JSON-object
    """
    try:
        data = request.get_json()
        positions = data["positions"]
        snps_to_gene = data["snps_to_gene"]
        gene_to_go = data["gene_to_go"]
        sig_level = data["sig_level"]
        all_snps = data["all_snps"]
        result = go_enrichment(all_snps, positions,snps_to_gene,gene_to_go, float(sig_level))
        return result #go_enrichment(all_snps, positions,snps_to_gene,gene_to_go, float(sig_level))
    except:
        print("Unexpected error:", sys.exc_info()[0])
        return jsonify({'error': 'internal server error'}), 500


@app.route('/api/tree-statistics-request', methods=['POST'])
def compute_tree_statitics():
    """Parses data sent by frontend,  performs tree-analysis and
      sends result to client.

      :return: tree-analysis result as :type JSON-object
      """
    try:
        data = request.get_json()
        # print(request.get_json())
        nwk = data["nwk"]
        support = data["support"]
        num_to_lab = data["num_to_label"]
        snps_to_gene = data["snps_to_gene"]
        node_to_snps = data["node_to_snps"]
        gene_to_go = data["gene_to_go"]
        sig_level = data["sig_level"]
        all_snps = data["all_snps"]
        # go_to_description = data["go_to_description"]
        response = tree_enrichment(nwk,support, num_to_lab, all_snps, node_to_snps, snps_to_gene, gene_to_go, float(sig_level))
        return response
    except:
        print("Unexpected error:", sys.exc_info()[0])
        return jsonify({'error': 'internal server error'}), 500

# just for debugging purposes:
@app.route('/<path:subpath>', methods=['POST'])
def show_post_subpath(subpath):
    """shows content of POST message"""

    # noinspection PyPep8,PyBroadException
    try:
        print('ERROR: unexpected POST Subpath=%s' % escape(subpath))
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


@app.route('/test_timeout', methods=['GET'])
def test_timeout():
    print("start sleep")
    sleep(301)
    return jsonify("done")


if __name__ == "__main__":
    app.run(port=int("3001"))
