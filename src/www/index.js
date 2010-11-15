(function(){
	var appContext = {
			googleAnalyticsKey: "UA-11129132-6",
			lastQueryDate:null,
			startQueryDate:null,
			observers : [],
			watchId: null,
			refreshUrl : null,
			counter : 0,
			lastResultsCount: 0,
			startWatching : function(term) {
				this.stopWatching();
				
				window.location.hash = term;
				
				var _self = this;
				this.startQueryDate = new Date();
				_self.watchId = setInterval(function(){
					_self.lastQueryDate = new Date();
					var dataUrl = _self.getDataUrl(term);
					console.log('here');
					$.getJSON(dataUrl, function(data){
						console.log(data.results.length);
						_self.dispatchTrendChange([(_self.lastQueryDate.getTime()-_self.startQueryDate.getTime())/1000, _self.lastResultsCount+data.results.length]);
						_self.counter += 1;
						if(data.refresh_url != _self.refreshUrl)
							_self.lastResultsCount += data.results.length;
						else
							_self.lastResultsCount = 0;
						_self.refreshUrl = data.refresh_url;
						
					});
				}, 1000);
			},
			stopWatching : function() {
				if(this.watchId != null)
					clearInterval(this.watchId);
				this.refreshUrl = null;
				this.watchId = null;
				this.counter = 0;
				this.dispatchTrendReset();
				this.lastResultsCount = 0;
			},
			getDataUrl : function(searchTerm) {
				var d = new Date();
				if(this.refreshUrl == null)
					return "http://search.twitter.com/search.json?q="+searchTerm+"&since="+d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+"&callback=?";
				else
					return "http://search.twitter.com/search.json"+this.refreshUrl+"&callback=?";
			},
			watch : function(topic, func) {
				this.observers.push({t: topic, o:func}); 
			},
			dispatchTrendChange : function(data) {
				this.dispatch("trendChanges",data);
			},
			dispatchTrendReset : function() {
				this.dispatch("trendReset");
			},
			dispatch : function(eventName,eventData) {
				for(var i in this.observers) {
					if(this.observers[i].t == eventName)
						this.observers[i].o(eventData);
				}
			}
	};
	
	window['appContext'] = appContext;	
	
	Component.overrideCurrent();
	
	if(window.location.hash != "") {
		var term = window.location.hash.substr(1);
		appContext.startWatching(term);
		$("#submitQuery").val(term);
		$("#submitBtn").text("re-submit");
	}
})();