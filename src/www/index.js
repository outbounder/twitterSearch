(function(){
	var appContext = {
			googleAnalyticsKey: "UA-11129132-6",
			lastQueryDate:null,
			startQueryDate:null,
			observers : [],
			watchId: null,
			refreshUrl : null,
			counter : 0,
			startWatching : function(term) {
				this.stopWatching();
				
				var _self = this;
				this.startQueryDate = new Date();
				_self.watchId = setInterval(function(){
					_self.lastQueryDate = new Date();
					var dataUrl = _self.getDataUrl(term);
					$.getJSON(dataUrl, function(data){
						_self.refreshUrl = data.refresh_url;
						_self.dispatchTrendChange([_self.lastQueryDate.getTime()-_self.startQueryDate.getTime(), data.results.length]);
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
				this.dispatchTrendReset();
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