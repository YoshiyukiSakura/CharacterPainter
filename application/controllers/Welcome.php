<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends CI_Controller {

	/**
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 * 		http://example.com/index.php/welcome
	 *	- or -
	 * 		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the default controller in
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	public function index()
	{
		echo "<h1>本程序为JSON接口，请访问input或output等方法</h1>";
	}
	public function input(){
		$line = $this->input->post("data");
		$move = $this->input->post("move");
		//var_dump($post);
		foreach ($line as $point) {
				$x1 = $point['p1']['x'];
				$y1 = $point['p1']['y'];
				$x2 = $point['p2']['x'];
				$y2 = $point['p2']['y'];
				$width = $point['width'];
				$sql = "INSERT INTO `characters` (`x1`, `y1`, `x2`, `y2`, `width`, `move`) VALUES ('{$x1}', '{$y1}', '{$x2}', '{$y2}', '{$width}', '{$move}')";
				$this->db->query($sql);

		}
	}
	public function delete(){
		$this->db->query("DELETE FROM `characters` WHERE `move`>=0");
		echo $this->db->affected_rows();
	}
	public function inputFromSAE(){
		$line = json_decode($this->input->post("data"),true);
		$move = $this->input->post("move");
		//var_dump($post);
		foreach ($line as $point) {
				$x1 = $point['p1']['x'];
				$y1 = $point['p1']['y'];
				$x2 = $point['p2']['x'];
				$y2 = $point['p2']['y'];
				$width = $point['width'];
				$sql = "INSERT INTO `characters` (`x1`, `y1`, `x2`, `y2`, `width`, `move`) VALUES ('{$x1}', '{$y1}', '{$x2}', '{$y2}', '{$width}', '{$move}')";
				$this->db->query($sql);

		}
	}
	public function	output($mode = "normal"){
		if ($mode=="admin") {//管理模式
			$query = $this->db->query(" SELECT * FROM `description` ORDER BY `id` DESC LIMIT 30");
			if ($this->db->affected_rows() == 0) { echo "no-data";return; }//数据表为空的情况
			echo json_encode($query->result());
			return "admin";
		}
		$character = array();
		$query = $this->db->query(" SELECT `move` FROM `characters` ORDER BY `move` DESC LIMIT 1 ");
		if ($this->db->affected_rows() == 0) { echo "no-data";return;}//数据表为空的情况
		$moveCount = $query->result()[0]->move;
		for ($i=0; $i <= $moveCount; $i++) {
			$query = $this->db->query(" SELECT `x1`,`y1`,`x2`,`y2`,`width`,`move` FROM `characters` WHERE `move` = '{$i}' ");
			array_push($character, $query->result());
		}
		echo json_encode($character);
	}
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->library('session');
	}
}
