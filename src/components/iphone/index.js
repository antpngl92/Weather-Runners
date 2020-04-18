// import preact
import Router from 'preact-router';
import { h, render, Component} from 'preact';
import { createContext } from "preact-context";


// import stylesheets for ipad & button
import style from './style';
import style_iphone from '../button/style_iphone';

// import jquery for API calls
import $ from 'jquery';
// import the Button component
import Button from '../button';
// import images here from renders folder
import menuButtonVanilla from '../Render/Menu-Button.png';
import weatherRunnersLogo from '../Render/WeatherRunners-Logo.png';
import refreshIcon from '../Render/fromWeb/refreshIcon.png';


// Settings display component
class Settings extends Component {
	constructor(props)
		{
		super(props);
		this.state={
			selectedOption: "",

				/*Once radio button is fixed start implementing the backend for user inputs: temp and hum. */
				/*User input text types have attributes that need to be added in order to extract user information - similiar to value attr. in radio*/
			preferedTemp: "",
			preferedHum: ""
		};
	}
		/*VIEWER */
	handleOptionChange = ev =>{
		this.setState({
			selectedOption: ev.target.value
		});
		this.props.changeUnits(this.state.selectedOption);
		console.log(this.state.selectedOption);
	};
		/* TESTING METHOD  */
	handleFormSubmit = formSubmitEvent => {
		formSubmitEvent.preventDefault();

		//const prefTemp = createContext(this.state.preferedTemp);
		//const prefHum = createContext(this.state.preferedHum);
		this.setState({selectedTemp: this.state.tempValue});
		this.setState({selectedHum: this.state.humValue});

		this.props.changeTemp(this.state.selectedTemp);
		this.props.changeHum(this.state.selectedHum);
		console.log("Temp: " + this.state.selectedTemp);
		console.log("Hum: " + this.state.selectedHum);
	}

	handleTempInput = ev =>
	{
		this.setState({ tempValue: ev.target.value });
	}

	handleHumInput = ev =>
	{
		this.setState({ humValue: ev.target.value });
	}

	render() {
		return (
				<div class={style.menuAnimation}>
					<form>
  						<label>Celsius <input type="radio"
						  					  name="temp"
											  value="metric"
											  checked={this.state.selectedOption === "metric"}
											  onChange={this.handleOptionChange}

										/>
						</label>


  						<label>Kelvin <input type="radio"
						  					 name="temp"
											 value="imperial"
											 checked={this.state.selectedOption === "imperial"}
											 onChange={this.handleOptionChange}
									   />
						</label>

						<input class={style.menuInput} placeholder="Preffered Temperature" type="text" onInput={this.handleTempInput}/>
						<input class={style.menuInput} placeholder="Preffered Humidity" type="text"onInput={this.handleHumInput} />

						<a class={style.closeButton} onClick={this.handleFormSubmit}>
							<img src={ require('../Render/checkmark.png')}  alt="my image" class={style.closeButton}/>
						</a>
						<a class={style.closeButton} href="/">
							<img src={ require('../Render/cross.png')}  alt="my image" class={style.closeButton}/>
						</a>
					</form>
				</div>
		);
	}
}

// Weather Display component
// Will be used to display weather data
class Weather extends Component
{
	constructor(props)
	{
		super(props);
		this.setState({
			apilocation: this.props.location,
			apiunits: this.props.units,
			preferredTemperature: this.props.prefTemp,
			preferredHumidity : this.props.prefHum,
		});

		// API URL with a structure of : ttp://api.wunderground.com/api/key/feature/q/country-code/city.json
		// Warning: do NOT change the following line - this is our API key.
		let url = "https://api.openweathermap.org/data/2.5/weather?q=" + this.state.apilocation + ",&APPID=b5b85878e30ca734443f3a6772ba122d&units=" + this.state.apiunits;
		$.ajax({
			url,
			dataType: "jsonp",
			success : this.parseResponse,
			error(req, err){ console.log('API call failed ' + err); }
		});
	}

	parseResponse = (parsed_json) => {
		let location = parsed_json['name'];
		let temp_c = parsed_json['main']['temp'];
		let conditions = parsed_json['weather']['0']['description'];
		let humidity = parsed_json['main']['humidity'];
		let iconCode = parsed_json['weather']['0']['icon'];
		// set states for fields so they could be rendered later on
		this.setState({
			locate: location,
			temp: temp_c,
			cond : conditions,
			humid : humidity,
			iconUrl : "http://openweathermap.org/img/w/" + iconCode + ".png"
		});
		this.calculateWRScore();
	}

	calculateWRScore()
	{
		var wrScore = -1;
		var wrMessage = "";
		var preferredTemp = this.state.preferredTemperature;
 		var preferredHum = this.state.preferredTemperature;
		if(this.state.selectedOption === "imperial"){
			preferredTemp -=  273.15;
		}
		var tempDiff = Math.ceil(this.state.temp) - preferredTemp;
		var humDiff =parseInt( Math.abs(this.state.humid - preferredHum));
		console.log("preferredTemp " +preferredTemp );

		if(tempDiff == 0){
			wrScore = 100;
		}
		else if(tempDiff == 1){
			wrScore = 80;
		}
		else if(tempDiff == 2){
			wrScore = 70;
		}
		else if(tempDiff == 3){
			wrScore = 60;
		}
		else if(tempDiff == 4){
			wrScore = 50;
		}
		else if(tempDiff == 5){
			wrScore = 30;
		}
		else if(tempDiff == 6){
			wrScore = 20;
		}
		else if(tempDiff == 7){
			wrScore = 10;
		}
		else if(tempDiff >= 8 ){
			wrScore = 0;
		}


		if(preferredTemp == -100){

			document.getElementById("WRScore").style.visibility = "hidden";
			document.getElementById("wrMessage").style.visibility = "hidden";
		}

		else{

			if (wrScore >= 50){
					wrMessage = "Optimal for running";
				  document.getElementById('WRMessage').style.color = "green";
				}
			else{
					wrMessage = "Not Optimal for running";
					document.getElementById('WRMessage').style.color = "red";
				}
		}



		console.log("wrScore " + wrScore );
		this.setState({score: wrScore, message: wrMessage});

	}

	render()
	{
		console.log(this.state.iconUrl)
		//console.log("testing");
		//console.log("testing");

		// check if temperature data is fetched, if so add the sign styling to the page
		//const tempStyles = this.state.temp ? `${style.temperature} ${style.filled}` : style.temperature;
		return(
			<div class={style.weather}>
				<div class={ style.city }>{ this.state.locate }</div>


				<div>
					<img class={ style.weatherIcon } src={this.state.iconUrl}/>
					<span class={ style.temperature }>{ Math.ceil(this.state.temp) }°</span>
				</div>



				<div class={ style.text }>Conditions: { this.state.cond }</div>
				<div class={ style.text }>Humidity: { Math.ceil(this.state.humid) }%</div>
				<div class={ style.text }></div>
				<div>
					<h5 id="WRScore" class={style.text}> WR Score: <span>{this.state.score}%</span></h5>
					<h6 class={style.text}> <span id="WRMessage">{this.state.message}</span></h6>
				</div>
			</div>
		);
	}
}

class Weather5Day extends Component
{
	constructor(props)
	{
		super(props);
		this.setState({
			apilocation: this.props.location,
			apiunits: this.props.units,
			nextDays: new Array(5),
			nextTemps: new Array(5),
			nextConds: new Array(5),

			forecastIconUrls: new Array(5)
		});

		// API URL with a structure of : ttp://api.wunderground.com/api/key/feature/q/country-code/city.json
		// Warning: do NOT change the following line - this is our API key.
		let url = "https://api.openweathermap.org/data/2.5/forecast?q=" + this.state.apilocation + ",&APPID=b5b85878e30ca734443f3a6772ba122d&units=" + this.state.apiunits;
		$.ajax({
			url,
			dataType: "jsonp",
			success : this.parseResponse,
			error(req, err){ console.log('API call failed ' + err); }
		});
	}

	parseResponse = (parsed_json) => {

		let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		let dailyForecastDiff = 8;

		let nextDaysArr = new Array(5);
		let nextTempArr = new Array(5);
		let nextCondArr = new Array(5);
		let nextIconsArr = new Array(5);

		for (let i = 1; i <= 5; i++)
		{
			// Get each day's element in the json file
			var element = (i * dailyForecastDiff) - 1;

			// Get the day
			let date = new Date(parsed_json['list'][element]['dt_txt']);
			let temp = parsed_json['list'][element]['main']['temp'];
			let conditions = parsed_json['list'][element]['weather']['0']['description'];
			let forecastIconCode = parsed_json['list'][element]['weather']['0']['icon'];

			nextDaysArr[i-1] = days[date.getDay()];
			nextTempArr[i-1] = temp;
			nextCondArr[i-1] = conditions;

			nextIconsArr[i-1] = "http://openweathermap.org/img/w/" + forecastIconCode + ".png";
			console.log(nextDaysArr[i-1] + " " + nextTempArr[i-1] + " " + nextCondArr[i-1]);

			// Store the arrays as states
			this.setState({
				nextDays : nextDaysArr,
				nextTemps: nextTempArr,
				nextConds: nextCondArr,
				forecastIconUrls : nextIconsArr,
			});
		}
	}

	render()
	{
		return(
			this.state.nextDays && this.state.nextTemps && this.state.nextConds ?
			<div class={style.forecast}>
							<table>
							  <tr>
							    <td>{this.state.nextDays[0]}</td>
							    <td><img src={this.state.forecastIconUrls[0]}/></td>
							    <td>{Math.round(this.state.nextTemps[0])} °C</td>
							    <td>{this.state.nextConds[0]}</td>
							  </tr>
							  <tr>
							    <td>{this.state.nextDays[1]}</td>
							    <td><img src={this.state.forecastIconUrls[1]}/></td>
							    <td>{Math.round(this.state.nextTemps[1])} °C</td>
							    <td>{this.state.nextConds[1]}</td>
							  </tr>
							  <tr>
							    <td>{this.state.nextDays[2]}</td>
							    <td><img src={this.state.forecastIconUrls[2]}/></td>
							    <td>{Math.round(this.state.nextTemps[2])} °C</td>
							    <td>{this.state.nextConds[2]}</td>
							  </tr>
							  <tr>
							    <td>{this.state.nextDays[3]}</td>
							    <td><img src={this.state.forecastIconUrls[3]}/></td>
							    <td>{Math.round(this.state.nextTemps[3])} °C</td>
							    <td>{this.state.nextConds[3]}</td>
							  </tr>
							  <tr>
							    <td>{this.state.nextDays[4]}</td>
							    <td><img src={this.state.forecastIconUrls[4]}/></td>
							    <td>{Math.round(this.state.nextTemps[4])} °C</td>
							    <td>{this.state.nextConds[4]}</td>
							  </tr>
							</table>
			</div> : null
		);
	}
}

export default class Iphone extends Component {
//var Iphone = React.createClass({

	// a constructor with initial set states
	constructor(props){
		super(props);

		this.setState({
			location: 'London',
			locationValue: '',
			units: 'metric',
			prefHum: 20,
			prefTemp: -100,

		});

	}

	changeTemp(newValue)
	{
		this.setState({prefTemp : newValue,});
	}
	changeHum(newValue)
	{
		this.setState({prefHum : newValue,});
	}
	changeUnits(newValue)
	{
		this.setState({units: newValue,});
	}

	locationInput = ev =>
	{
		this.setState({ locationValue: ev.target.value });
	}

	locationSubmit = () =>
	{
		this.setState({location: this.state.locationValue});
	}

	refreshPage() {
		window.location.reload(false);
	}

	// the main render method for the iphone component
	render()
	{
		// check if temperature data is fetched, if so add the sign styling to the page
		const tempStyles = this.state.temp ? `${style.temperature} ${style.filled}` : style.temperature;

		// display all weather data
		//<h1 class={style.header}>WeatherRunners</h1>
		return (
			<div class={ style.container }>

				{/*<div>*/}
				{/*	<img src={require('../Render/Top-Half-BG.png')} alt="background" className={style.topHalf}/>*/}
				{/*</div>*/}

				<br/><br/><br/><br/>

				{<a href="/"><img src={require('../Render/WeatherRunners-Logo.png')} class={style.weatherRunnersImg}/></a>} {/*this is original line that was here*/}



				<div >
					<img src={require('../Render/profile-user.png')} alt="profileIcon" className={style.profileIconStyling}/>

					<p className = {style.dummyUser}>John Smith <br> </br> Jsmith@gmail.com
					</p>

					<a class={style.menuButtonStyle} href="/settings">
						<img src={ require('../Render/Menu-Button.png')}  alt="my image" class={style.menuIconImage}/>
					</a>
				</div>

				<Router>
					<Settings path="/settings"
					changeTemp={this.changeTemp.bind(this)} changeUnits={this.changeUnits.bind(this)} changeHum={this.changeHum.bind(this)}/>
				</Router>

				<div id="topContent">
					<h2 class={style.location}>Current location: {this.state.location}</h2>

					<div>

						<img src={require('../Render/Location-Search-Bar.png')} alt="searchBar" className={style.searchBar}/>

					<form>
						<input class={style.inputNavBar} placeholder="Different Location?" type="text" value={this.state.locationValue} onInput={this.locationInput}/>
						<button class={style.inputGo} type="button" onClick={this.locationSubmit}>Go</button>
					</form>

					</div>
				</div>



				<div class={style.footerButtons} style="list-style-type: none;">

					<div class={style.buttonList1}>
						<a  href="/weather">
							<img  class={style.iconButton1L}  src={require('../Render/todaywcircle.png')}/>
						</a>
						<label id={style.forButtonList1}>Today's Forecast</label>
					</div>

  				<div class={style.buttonList2}>
						<a href="/weather">
							<img class={style.iconButton2C } src={require('../Render/fromWeb/refreshIcon.png')} alt="refreshIcon"   onClick={this.refreshPage}/>
						</a>
						<label id={style.forButtonList2}>
							Refresh
						</label>
					</div>

  				<div class={style.buttonList3}>
						<a href="/weatherForecast">
							<img  class={style.iconButton3R}  src={require('../Render/forecastwcircle.png')}/>
						</a>
						<label id={style.forButtonList3}>
							5 Day Forecast
						</label>

					</div>

			 </div>




					<Router>
						<Weather path="/weather" location={this.state.location} prefTemp={this.state.prefTemp} prefHum={this.state.prefHum} units={this.state.units}
						changeTemp={this.changeTemp.bind(this)} changeUnits={this.changeUnits.bind(this)} changeHum={this.changeHum.bind(this)}/>
						<Weather5Day path="/weatherForecast" location={this.state.location} units={this.state.units}/>
					</Router>


			</div>
		);
	}
}
