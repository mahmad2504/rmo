<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">

  <title>The HTML5 Herald</title>
  <meta name="description" content="The HTML5 Herald">
  <meta name="author" content="SitePoint">

  <link rel="stylesheet" href="css/jquery.2.7.1.contextMenu.min.css">
  <link rel="stylesheet" href="css/font-awesome.4.7.0.min.css">
  <link rel="stylesheet" href="css/rmo.css">
  <style>
  
  </style>
  
</head>

<body>
<h1>RMO Sheet</h1>
<div id="divtable1" class=""></div>
<hr>
<div id="divtable2" class=""></div>
<script src="js/jquery-3.4.1.min.js"></script>
<script src="js/jquery.contextMenu.2.7.1.min.js"></script>
<script src="js/jquery.ui.2.7.1,position.js"></script>
<script src="js/rmo.js"></script>
<script>
var 

projects=[
            {
			'id' : 1,
			'name' : 'project1'
			},
            {
			'id' : 2,
			'name' : 'project2'
			},
            {
			'id' : 3,
			'name' : 'project3'
			},
           ];
resources=[
			{
				'id':1,
				'name':'Mumtaz'
			},
            {
				'id':2,
				'name':'Shakeen'
			},
			{
				'id':3,
				'name':'Qadeer'
			}
           ];
		   
var data = [ 
	{
	'id' : 1,
	'name' : 'mahmad',
	'projects' :[
		{
			'id' : 1,
			'name' : 'project1'
		},
		{
			'id' : 2,
			'name' : 'project2'
		}
		]
	},
	{
	'id' : 2,
	'name' : 'shakeel',
	'projects' :[
		{
			'id' : 1,
			'name' : 'project1'
		},
		{
			'id' : 2,
			'name' : 'project2'
		}
		]
	}
];



 $( document ).ready(function()
 {
	 var start = new Date();
     start.setMonth(start.getMonth()  - 6);
	 
	 var end = new Date();
     end.setMonth(end.getMonth()  + 9);	
	 //rmo1 = new Rmo(start, end,resources,projects);
	 //rmo1.today_color = '#FF0000';
     //rmo1.Show('divtable1',data);
	 
	 rmo2 = new Rmo(start, end,resources,projects);
	 rmo2.Show('divtable2',data);
	 
	 
	 
 });
</script>
</body>
</html>