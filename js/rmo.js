//TODAY_COLOR='#8FBC8F';
UTIL_OVER_COL = '#FFA500';
UTIL_100_COL='#32CD32';//'#5588ff';
UTIL_75_COL='#ADFF2F';
UTIL_50_COL='#F0E68C';
UTIL_25_COL='#FFFF00';
UTIL_0_COL='#FFFFFF';
FTO_COL='#CDCDCD';

function Rmo(start,end,resources,projects)
{
	var self = this;
	this.start = start;
	this.end = end;
	this.resources=resources;
	this.projects=projects;
	window.utilization =100;
	this.dateArray = null;
	this.today_color='#8FBC8F';
	Date.prototype.addDays = function(days) 
	{
		var dat = new Date(this.valueOf())
		dat.setDate(dat.getDate() + days);
		return dat;
	}
	Date.prototype.getWeek = function() {
	  var onejan = new Date(this.getFullYear(),0,1);
	  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
	}
	this.isToday = (someDate) => {
	  const today = new Date()
	  return someDate.getDate() == today.getDate() &&
		someDate.getMonth() == today.getMonth() &&
		someDate.getFullYear() == today.getFullYear()
	}
	this.MonthName = function(month)
	{
		if(month == 0)
			return "January";
		else if(month == 1)
			return "February";
		else if(month == 2)
			return "March";
		else if(month == 3)
			return "April";
		else if(month == 4)
			return "May";
		else if(month == 5)
			return "June";
		else if(month == 6)
			return "July";
		else if(month == 7)
			return "August";
		else if(month == 8)
			return "September";
		else if(month == 9)
			return "October";
		else if(month == 10)
			return "November";
		else if(month == 11)
			return "December";
		return month;
	}
	this.ISO8601_week_no =  function(dt) 
	{
		var tdt = new Date(dt.valueOf());
		var dayn = (dt.getDay() + 6) % 7;
		tdt.setDate(tdt.getDate() - dayn + 3);
		var firstThursday = tdt.valueOf();
		tdt.setMonth(0, 1);
		if (tdt.getDay() !== 4) 
		{
			tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
		}
		return 1 + Math.ceil((firstThursday - tdt) / 604800000);
	}
	this.PreProcess = function(data)
	{
		for(var i=0;i<this.resources.length;i++)
		{
			resource = this.resources[i];
			resource.projects = [{'index':0,'id':-1,'name':'None'}];
			for(var j=0;j<window.data.length;j++)
			{
				dresource = data[j];
				if(dresource.id == resource.id)
				{
					for(var k=0;k<dresource.projects.length;k++)
					{
						dresource.projects[k].index=k;
					}
					break;
				}
			}
			if(j==data.length)// not found
				data.push(resource);
		}
		window.data=data;
	}
	this.DrawResourceRows=function()
	{
		for(var i=0;i<window.data.length;i++)
		{
			resource = window.data[i];
			resource.element = self.GenerateResourceRow(resource);
		}
	}
	this.DrawProjectRows=function()
	{
		for(var i=0;i<window.data.length;i++)
		{
			resource = window.data[i];
			parent=resource.element;
			for(var j=0;j<resource.projects.length;j++)
			{
				var project=resource.projects[j];
				parent = project.element = self.GenerateProjectRow(parent,resource,project);
				project.element.hide();
			}
		}
	}
	this.DeleteRowHandler = function()
	{
		var resourceid=$(this).data("resourceid");
		var projectindex=$(this).data("projectindex");
		
		for(var i=0;i<window.data.length;i++)
		{
			resource=window.data[i];
			if(resource.id == resourceid)
			{
				for(var j=0;j<resource.projects.length;j++)
				{
					if(resource.projects[j].index == projectindex)
					{
						var index = resource.projects[j].index;
						resource.projects[j].element.remove();
						resource.projects = resource.projects.filter(function(item) {
							return item.index !== index
						})

					}
						
				}
			}
		}
		for (var week in window.dateArray.weekArray) 
		{
			self.UpdateAccumulativeUtilization(resourceid,week);
		}
	}
	this.ProjectCellClickHandler = function()
	{
		
		var resourceid=$(this).data("resourceid");
		var projectindex=$(this).data("projectindex");
		$(this).css('background-color',FTO_COL);
		self.PaintProjectCell($(this),window.utilization);
		
	}
	this.Show = function(tag,data)
	{
		this.dateArray = self.GenerateTableData(this.start.getFullYear(),this.start.getMonth()+1,this.end.getFullYear(),this.end.getMonth()+1);
		window.dateArray = this.dateArray;
		this.tag=tag;
		self.CreateTable('#'+tag);
		self.PreProcess(data);
		self.DrawResourceRows();
		self.DrawProjectRows();
		window.data=data;
		
		$('.delete').click(self.DeleteRowHandler);
		$('.pcell').click(self.ProjectCellClickHandler);
		$('.addrow').click(
			function()
			{
				var resourceid=$(this).data("resourceid");
				for(var i=0;i<window.data.length;i++)
				{
					resource=window.data[i];
					var parent = resource.element;
					var newproject = {};
					if(resource.id == resourceid)
					{
						console.log(resource.projects.length);
						if(resource.projects.length > 0)
						{
							var lastproject = resource.projects[resource.projects.length-1];
							newproject={'id':-1,'name':'None','index':lastproject.index+1};
							parent = lastproject.element;
							//var parent = resource.element;
						}
						else
						{
							newproject={'id':-1,'name':'None','index':0};
							//var parent = resource.element;
						}
						
						resource.projects.push(newproject);
						newproject.element = self.GenerateProjectRow(parent,resource, newproject);
						$('.delete').click(self.DeleteRowHandler);
						$('.pcell').click(self.ProjectCellClickHandler);
					}
				}
			}
		 );
		$('.expand').click(
			function()
			{
				var expanded=$(this).data("expanded");
				var resourceid=$(this).data("resourceid");
				if( (expanded=== undefined)||(expanded=='0'))
				{
					for(var i=0;i<window.data.length;i++)
					{
						resource=window.data[i];
						if(resource.id == resourceid)
						{
							for(var j=0;j<resource.projects.length;j++)
							{
								resource.projects[j].element.show();
							}
							resource.addrow.element.show();
						}
					}
					$(this).removeClass('fa-caret-square-o-down');
					$(this).addClass('fa-caret-square-o-up');
					$(this).data('expanded', '1');
				}
				else
				{
					for(var i=0;i<window.data.length;i++)
					{
						resource=window.data[i];
						if(resource.id == resourceid)
						{
							for(var j=0;j<resource.projects.length;j++)
							{
								resource.projects[j].element.hide();
							}
							resource.addrow.element.hide();
						}
					}
					$(this).addClass('fa-caret-square-o-down');
					$(this).removeClass('fa-caret-square-o-up');
					$(this).data('expanded', '0');
				}
			}
		);
		
		$.contextMenu(
		{
			autoHide:true,
			selector: '.pcell', 
			items: 
			{
				radio100: {
					name: "100%", 
					type: 'radio', 
					radio: 'radio', 
					value: '100', 
					selected: true
				},
				radio75: {
					name: "75%", 
					type: 'radio', 
					radio: 'radio', 
					value: '75'
				},
				radio50: {
					name: "50%", 
					type: 'radio', 
					radio: 'radio', 
					value: '50', 
					//disabled: true
				},
				radio25: {
					name: "25%", 
					type: 'radio', 
					radio: 'radio', 
					value: '25', 
					//disabled: true
				},
				radiofto: {
					name: "FTO", 
					type: 'radio', 
					radio: 'radio', 
					value: '-1'
				},
				radionone: {
					name: "Clear", 
					type: 'radio', 
					radio: 'radio', 
					value: '0'
				}
			}, 
			events: 
			{
				show: function(opt) 
				{
					// this is the trigger element
					//var $this = this;
					console.log($(this).attr('id'));
					$(this).addClass('highlight');
					// import states from data store 
					rert = 
					{
						"name": "dd",
						"yesno": false,
						"select": null
					}
					data = this.data();
					console.log(data);
					if(data.radio === undefined)
						data ={"radio":window.utilization.toString()};
					else
						data.radio = data.radio.toString();
					//data = {"radio": "75"};
					$.contextMenu.setInputValues(opt,data);
					// this basically fills the input commands from an object
					// like {name: "foo", yesno: true, radio: "3", &hellip;}
				}, 
				hide: function(opt) 
				{
					// this is the trigger element
					//var $this = this;
					console.log(this.data());
					console.log($(this).attr('id'));
					// export states to data store
					$(this).removeClass('highlight');
					ret = $.contextMenu.getInputValues(opt, this.data());
					
					self.PaintProjectCell( $(this),ret.radio );
				   
					console.log(ret);
					// this basically dumps the input commands' values to an object
					// like {name: "foo", yesno: true, radio: "3", &hellip;}
				}
			}
		});
	}
	
	this.PaintProjectCell = function(element,value)
	{
		if( value == -1)
		{
			element.css('background-color',FTO_COL);
		}
		else if( value == 100)
		{
			element.css('background-color',UTIL_100_COL);
		}
		else if( value == 75)
		{
			element.css('background-color',UTIL_75_COL);
		 }
		else if( value == 50)
		{
			element.css('background-color',UTIL_50_COL);
		}
		else if( value == 25)
		{
			element.css('background-color',UTIL_25_COL);
		}
		else
		{
			element.css('background-color',UTIL_0_COL);
			
		}
		element.data( "radio", value ); 
		var fields = element.attr('id').split("_");
		self.UpdateAccumulativeUtilization(fields[0],fields[2]+"_"+fields[3]);
		//updatedcells.push(element);
		window.utilization=value;
	}
	this.UpdateAccumulativeUtilization = function(resourceid,week)
	{	   
	   rcell = $('#'+resourceid+'_'+week);
	   //acc_cell = $(cells[0]);
	   acc = 0;
	   for(i=0;i<data.length;i++)
	   {
		   resource=data[i];
		   if(resource.id == resourceid)
		   {
			   for(var j=0;j<resource.projects.length;j++)
			   {
					var project=resource.projects[j];
					var pcell = $('#'+resourceid+'_'+project.index+"_"+week);
					console.log('#'+resourceid+'_'+project.index+"_"+week);
					console.log(pcell);
					var utilization = pcell.data('radio');
					console.log(utilization);
					if(utilization === undefined)
						continue;
					utilization = parseInt(utilization);
					acc += utilization;
			   }   
		   }
	   }
	   self.PaintResourceCell(rcell,acc);
	}
	this.PaintResourceCell = function(element, value)
	{
		console.log(value);
		if( value == -1)
		{
			element.css('background-color',FTO_COL);
		}
		else if( value == 100)
		{
			element.css('background-color',UTIL_100_COL);
		}
		else if( value == 75)
		{
			element.css('background-color',UTIL_75_COL);
		 }
		else if( value == 50)
		{
			element.css('background-color',UTIL_50_COL);
		}
		else if( value == 25)
		{
			element.css('background-color',UTIL_25_COL);
		}
		else if( value > 100)
			element.css('background-color',UTIL_OVER_COL);
		else
		{
			element.css('background-color',UTIL_0_COL);
			
		}
		element.data( "acc", value ); 
	}
	
	this._GetDates =  function(startDate, stopDate) 
	{
		var dateArray = new Array();
		var currentDate = startDate;
		while (currentDate <= stopDate) 
		{
			dateArray.push(currentDate)
			currentDate = currentDate.addDays(1);
		}
		return dateArray;
	}
	this.CreateTable = function(tag)
	{
		table = $('<table>');
		table.addClass("RmoTable");
		
		$(tag).append(table);
		
		yearrow = self.GenerateYearRow();
		table.append(yearrow);
		
		monthrow = self.GenerateMonthRow();
		table.append(monthrow);
		
		weekrow = self.GenerateWeekRow();
		table.append(weekrow);
		
		this.table = table;
		
	}
	this.GenerateProjectRow=function(parent,resource,project)
	{
		var deleteicon=$('<i style="margin-top:3px;font-size:12px; float:right;" class="fa fa-times-circle" aria-hidden="true"></i>');
		
		var select=$('<select></select>');
		if(project.id == -1)
			select.append('<option value="-1" selected>Select</option>');
		else
			select.append('<option value="-1">Select</option>');
		
		found=0;
		for (var i=0;i<this.projects.length;i++) 
		{
			if(this.projects[i].id == project.id)
			{
				select.append('<option value="'+this.projects[i].id+'" selected>'+this.projects[i].name+'</option>');
				found=1;
			}
			else
				select.append('<option value="'+this.projects[i].id+'">'+this.projects[i].name+'</option>');
		}
		if(found==0)
		{
			if(project.id >= 0)
				select.append('<option value="'+project.id+'" selected>'+project.name+'</option>');

		}
		/////////////////////////////////////////////////////////////////////
		
		deleteicon.addClass('delete');
		deleteicon.data('resourceid',resource.id);
		deleteicon.data('projectindex',project.index);
		
		var row = $('<tr></tr>');
		var cell=$('<td></td>');
		cell.append(select);
		row.append(cell);
		cell2=$('<td></td>');
		cell2.append($(deleteicon));
		row.append(cell2);
		cells = self.GenerateProjectRowCells(resource,project,row); 
		
		//parent.append(row);
		parent.after(row);
		return row;
	}
	this.GenerateResourceRow= function(resource) 
	{
		expandicon = $('<i style="float:left;margin-right:5px" class="fa fa-caret-square-o-down" aria-hidden="true"></i>');
		//dropupicon = $('<i class="fa fa-caret-square-o-up" aria-hidden="true"></i>');
		addrowicon= $('<i style="font-size:10px;float:right;margin-top:3px;" class="fa fa-plus" aria-hidden="true"></i>');
		resourcename= $('<span style="margin-left:5px;">'+resource.name+'</span>');
		
		expandicon.addClass('expand');
		expandicon.data('resourceid',resource.id);
		
		addrowicon.addClass('addrow');
		addrowicon.data('resourceid',resource.id);
		resource.addrow = {};
		resource.addrow.element = addrowicon;
		resource.addrow.element.hide();
		
		row = $('<tr></tr>');
		cell=$('<td width="100%"></td>');
		cell.append(expandicon);
		cell.append(resourcename);
		//cell.addClass('fa fa-plus-circle');
		row.append(cell);
		cell2=$('<td></td>');
		cell2.append(addrowicon);
		row.append(cell2);
		cells = self.GenerateResourceRowCells(resource,row); 
		row.append(cells);
		//html += '</tr>';
		//var row = $(html)
		this.table.append(row);
		//$('#'+idadd).hide();
		return row;
	}
	this.GenerateYearRow = function()
	{
		yearArray = this.dateArray.yearArray;
		html = '<tr class="row_year">';
		html += '<th class="cell_year">Year</th>';
		html += '<th class="cell_year">None</th>';
		color='#DCDCDC';
		for (var year in yearArray) 
		{
			if(yearArray[year].includes(1))
				color=this.today_color;
			else
			{
				if(color==this.today_color)
					color='#FFFFFF';
			}
			colspan = Object.keys(yearArray[year]).length;
			html += '<th style="background-color:'+color+';" class="cell_year" colspan="'+colspan+'">'+year+'</th>';
		}
		html += '</tr>';
		return $(html);
	}
	this.GenerateMonthRow =  function()
	{
		monthArray = this.dateArray.monthArray;
		html = '<tr class="row_month">';
		html += '<th class="cell_month" >Month</th>';
		html += '<th class="cell_month" ></th>';
		color='#DCDCDC';
		for (var month in monthArray) 
		{
			if(monthArray[month].includes(1))
				color=this.today_color;
			else
			{
				if(color==this.today_color)
					color='#FFFFFF';
			}
			colspan = Object.keys(monthArray[month]).length;
			html += '<th style="background-color:'+color+';" class="cell_month" colspan="'+colspan+'">'+self.MonthName(month.substring(5))+'</th>';
		}
		html += '</tr>';
		return $(html);
	}
	this.GenerateWeekRow = function()
	{
		weekArray = this.dateArray.weekArray;
		var html = '<tr class="row_week">';
		html += '<th  class="cell_week"><span style="margin-left:30px;margin-right:30px;">Week</span></th>';
		html += '<th  class="cell_week"></th>';
		html += self.GenerateCells(null,null,'th',1);
		/*sub=0;
		for (var week in weekArray) 
		{
			colspan = Object.keys(weekArray[week]).length;
			week = week.substring(5);
			if(week==1&&colspan==0)
				sub=1;
			else if(week==1)
				sub=0;
			 
			week=week-sub;
			if(week < 10)
				week = "&nbsp&nbsp"+week+"&nbsp&nbsp";
			else
				week = "&nbsp"+week+"&nbsp";
			if(colspan>0)
				html += '<th width="40px;" style="font-size:10px;" colspan="'+colspan+'">'+week+'</th>';
		 }*/
		 html += '</tr>';
		 return $(html);
	}
	this.GenerateResourceRowCells = function(resource,row)
	{
		weekArray =  this.dateArray.weekArray;
		for (var week in weekArray) 
		{
			if(weekArray[week].length < 7)
				continue;
			colspan = Object.keys(weekArray[week]).length;
			cell = $('<td  width="40px;" colspan="'+colspan+'">'+'</td>');
			cell.attr('id', resource.id+"_"+week);
			row.append(cell);
		}
	}
	this.GenerateProjectRowCells = function(resource,project,row)
	{
		weekArray =  this.dateArray.weekArray;
		for (var week in weekArray) 
		{
			if(weekArray[week].length < 7)
				continue;
			colspan = Object.keys(weekArray[week]).length;
			cell = $('<td  width="40px;" colspan="'+colspan+'">'+'</td>');
			cell.attr('id', resource.id+"_"+project.index+"_"+week);
			cell.addClass('pcell');
			cell.data('resourceid',resource.id);
			cell.data('projectindex',project.index);
			row.append(cell);
		}
	}
	this.GenerateCells = function(resource=null,project_index=null,tag='td',showweek=0)
	{
		weekArray =  this.dateArray.weekArray;
		var html='';
		var sub=0;
		var id='';
	   
	  // $('element').attr('id', 'value');
	   //$( "p" ).addClass( "myClass yourClass" );
		var cls = 'cell_'+tag;
		if(resource != null)
		{
			cls = 'cell_'+tag+' cell_resource';
			id='rcell_'+resource.id;
		}
		if(project_index != null)
		{
			cls = 'cell_'+tag+' cell_project';
			id='pcell_'+resource.id+"_"+project_index;
		}
		
		//var today = new Date();
		// todayyear  = today.getFullYear();
		color='#DCDCDC';
		currentweek=0;
		for (var week in weekArray) 
		{
			if(weekArray[week].length < 7)
				continue;
			
			if(currentweek == 0)
			{
				for(key in weekArray[week])
				{
					//console.log(weekArray[week][key]);
					if(weekArray[week][key].today == 1)
					{
						//console.log(weekArray[week][key]);
						currentweek=1;
					}
					
				}
			}
			
			colspan = Object.keys(weekArray[week]).length;
			//console.log(week);
			//console.log(colspan);
			year = week.substring(0,4);
			week = week.substring(5);
			var data='data-year="'+year+'"';
			data= data+' data-week="'+week+'"';
			if(resource !=  null)
				ncls = cls+' column_'+resource.id+'_'+year+'_'+week;
			else
				ncls = cls;
			
			if(resource != null)
				data=data+' data-resource="'+resource.id+'"';
			if(project_index != null)
			   data=data+' data-pindex="'+project_index+'"';
			
			data=data+' data-tag="'+this.tag+'"';
			
			nid = id+"_"+year+"_"+week;
			if(week==1&&colspan==0)
				sub=1;
			else if(week==1)
				sub=0;
			 
			//week=ParseInt(week)+ParseInt(sub);
			if(showweek)
			{
				if(week < 10)
					week = "&nbsp&nbsp"+week+"&nbsp&nbsp";
				else
					week = "&nbsp"+week+"&nbsp";
			}
			else
				week='';
			if(colspan>0)
			{
				if(currentweek==1 && showweek)
				{
					html += '<'+tag+' '+data+' style="background-color:'+this.today_color+';" class="'+ncls+'" id="'+nid+'" width="40px;" colspan="'+colspan+'">'+week+'</'+tag+'>';
					color = '#FFFFFF';
					currentweek=2;
				}
				else if(showweek)
					html += '<'+tag+' '+data+' style="background-color:'+color+';" class="'+ncls+'" id="'+nid+'" width="40px;" colspan="'+colspan+'">'+week+'</'+tag+'>';
				else
					html += '<'+tag+' '+data+' class="'+ncls+'" id="'+nid+'" width="40px;" colspan="'+colspan+'">'+week+'</'+tag+'>';
			}
		 }
		 return html;
	}

	this.GenerateTableData =   function(startyear,startmonth,endyear,endmonth)
	{
		var dateArray = self._GetDates(new Date(startyear,startmonth-1,1), new Date(endyear,endmonth,0 ));
		j=0;
		k=0;
		l=0;
		yearArray=[];
		monthArray=[];
		weekArray=[];
		for (i = 0; i < dateArray.length; i ++ ) 
		{
			week=self.ISO8601_week_no(dateArray[i]);
			year=dateArray[i].getFullYear();
			if(week == 1 && dateArray[i].getMonth() == 11)// Boundary condition  
				year = year+1;
			
			if(week == 53 && dateArray[i].getMonth() == 0)// Boundary condition  
				year = year-1;
			
			if(weekArray[year+"_"+week] === undefined)
			{
				weekArray[year+"_"+week]=[]
				l=0;
			}
			 
			
			today=0;
			if( self.isToday(dateArray[i]) )
			{
				console.log("Today is "+dateArray[i].toString());
				today=1;
			}
			weekArray[year+"_"+week][l++]={'week':week,'today':today,'date':dateArray[i].toString()};
		   
			///////////////////////////////////////////////////////////////////
		   
			year=dateArray[i].getFullYear();
			if(yearArray[year] === undefined)
			{
				yearArray[year]=[]
				j=0;
			}
			
			
			yearArray[year][j++] = today;
			
			month=dateArray[i].getMonth();
			if(monthArray[year+"_"+month] === undefined)
			{
				monthArray[year+"_"+month]=[]
				k=0;
			}
			monthArray[year+"_"+month][k++]=today;
			
			//week=dateArray[i].getWeek();
			//week=ISO8601_week_no(dateArray[i]);
			
				 
			//console.log(dateArray[i]);
			//console.log(week);
			/*if(weekArray[year+"_"+week] === undefined)
			{
				weekArray[year+"_"+week]=[]
				l=0;
			}
			weekArray[year+"_"+week][l++]={'week':week,'today':today,'date':dateArray[i].toString()};*/
			
			//console.log(dateArray[i].getWeek());
			//console.log(dateArray[i]);
			// yearArray[$year][] =date('Y-m-d-D', $time);
		}
		
		/*lastindex = null;
		i=0;
		for(var index in weekArray)
		{
			if(weekArray[index].length < 7)
			{
				weeknumber = weekArray[index][0].week;
				if((lastindex != null)&&(weeknumber==1))
				{
					weekArray[lastindex] = weekArray[lastindex].concat(weekArray[index]);
					weekArray[index] = [];
					//delete weekArray[index];
				
				}
			 }
			i++;
			lastindex = index;
		}*/
		ret = {};
		ret.weekArray = weekArray;
		ret.monthArray = monthArray;
		ret.yearArray = yearArray;
		//console.log(weekArray);
		
		return ret;
		//console.log(weekArray);
	}
}

