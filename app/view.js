/** @jsx m */

exports.get = xView

function xView(vm) {
    
    var navbar = <div class="container-fluid">
        <a class="navbar-brand" href="#">
            <img class="owl-icon" src="./Rice_Owl_small.jpg"></img>
        </a>
        <a class="navbar-brand blue-text" href="#">
            Tweeter
        </a>
        <div class="navbar-default pull-right">
            {
                vm.loggedIn ? 
                <input value={ 'Welcome ' + vm.username() + '!' }
                    class="navbar-default login-field welcome"
                    readonly /> : 
                <input placeholder="username" 
                    class="navbar-default login-field"
                    oninput={ m.withAttr("value", vm.username) } />
            }

            <button class="btn btn-primary"
                onclick={ vm.loggedIn ? vm.logout : vm.login } >
                { vm.loggedIn ? 'logout' : ' login' } 
            </button>            
        </div>
    </div>

    var newTweet = <div class="tweet">
        <div class="tweetbox" contenteditable="true"
            oninput={ m.withAttr("innerText", vm.newTweetBody) } >          
            { vm.newTweetBody() }
        </div>
            
        <div>
            <span class={ (vm.newTweetBody() ? vm.newTweetBody().length : 0) > vm.MAX_TWEET_LENGTH ?
                "tweet tweetLength tweetRed" : "tweet tweetLength" }>
                Your tweet is { vm.newTweetBody() ? vm.newTweetBody().length : 0 } characters long                    
            </span>
            <button class="btn btn-success tweetBtn" onclick={ function() { vm.addTweet(vm) } }>Tweet</button>            
        </div>
    </div>

    ///////////////////////////////////////////////////////////////////////////
	return <div>

<nav class="navbar navbar-default navbar-static-top">
    { navbar }
    { vm.loggedIn ? newTweet : <div class="noTweet">login to make a tweet!</div> }
    <div class="alert alert-danger" style={ vm.error().length ? 'display: block' : 'display: none' }>
        { vm.error() }
    </div>
</nav>

{
	vm.tweets.map(function(tweet, index) {       
		return <div class="feed">
			<span class="author">{ tweet.author() }</span>            
            <span class="timestamp">{ moment(tweet.timestamp()).fromNow() }</span>
			<div>{ tweet.body() }</div>
		</div>
	})
}

	</div>;
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
}


function mView(vm) {
    return m("html", [
    	m("head", [
    		m("link[href='style.css'][rel=stylesheet]")
  		]),
        m("body", [ 

        	m("input", {
        		placeholder: 'enter your name',
        		oninput: m.withAttr("value", vm.newTweetAuthor),
        	}, vm.newTweetAuthor()),

        	m("div", {
        		class: 'tweetbox',  
        		contenteditable:'true',
        		oninput: m.withAttr("innerText", vm.newTweetBody),        		
        	}, vm.newTweetBody()),
            
            m("div", { style: {
            	fontStyle: 'italic',
            	fontSize: '0.8em',
            	color: (vm.newTweetBody() ? vm.newTweetBody().length : 0) > vm.MAX_TWEET_LENGTH ? "red" : "black"
            } }, "Your tweet is " + (vm.newTweetBody() ? vm.newTweetBody().length : 0) + " characters long"),
            m("button", { onclick: function() { vm.addTweet(vm) } }, "Tweet"),

            m("table", [
               
            ])

        ]) // end html.body
    ])
} // end view

