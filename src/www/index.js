(function(){
	var appContext = {
			googleAnalyticsKey: "",
			lastQueryDate:null,
			startQueryDate:null,
			observers : [],
			watchId: null,
			refreshUrl : null,
			counter : 0,
			tickOnEvery : 10,
			startWatching : function(term) {
				this.stopWatching();
				
				var _self = this;
				this.startQueryDate = new Date();
				_self.watchId = setInterval(function(){
					_self.lastQueryDate = new Date();
					var dataUrl = _self.getDataUrl(term);
					$.getJSON(dataUrl, function(data){
						_self.refreshUrl = data.refresh_url;
						if(data.results.length > 0 || _self.counter > _self.tickOnEvery) {
							_self.dispatchTrendChange([_self.lastQueryDate.getTime()-_self.startQueryDate.getTime(), data.results.length*data.results_per_page]);
							_self.count = 0;
						}
						_self.counter += 1;
					});
				}, 1000);
			},
			stopWatching : function() {
				if(this.watchId != null)
					clearInterval(this.watchId);
				this.refreshUrl = null;
				this.watchId = null;
				this.counter = 0;
			},
			getDataUrl : function(searchTerm) {
				if(this.refreshUrl == null)
					return "http://search.twitter.com/search.json?q="+searchTerm+"&since=2010-11-13&callback=?";
				else
					return "http://search.twitter.com/search.json"+this.refreshUrl+"&callback=?";
			},
			watch : function(topic, func) {
				this.observers.push({t: topic, o:func}); 
			},
			dispatchTrendChange : function(data) {
				for(var i in this.observers) {
					if(this.observers[i].t == "trendChanges")
						this.observers[i].o(data);
				}
			}
	};
	
	window['appContext'] = appContext;	
	
	Component.overrideCurrent();
})();