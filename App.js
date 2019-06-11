import React, {Component} from 'react';
import {Alert, Button, Platform, StyleSheet, Text, View, Linking} from 'react-native';
import { authorize } from 'react-native-app-auth';
import { DeviceEventEmitter } from 'react-native';
import qs from 'qs';
import URL from 'url-parse';
import axios from 'axios';
import AxiosLogger from 'axios-logger';
import Buttoncluster from './components/buttoncluster'

var Buffer = require('buffer/').Buffer;
const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};

axios.interceptors.request.use(request => {
  console.log('Starting Request', request)
  return request
})
export default class App extends Component<Props> {
    state={
        heartrate:"__",
        dummyheartrate:151
    }
    dumbHRgenerator = (generate) =>{
        let counter;
        if(generate)
        {
               counter = setInterval(()=>{
                   this.setState({...this.state, dummyheartrate:this.state.dummyheartrate+1});
            }, 1000)
        }   
        else
        {
            clearInterval(this.state.counter_id);
        }
    }
    handleHeartrateChange = (e) => {
        this.setState({heartrate:e.heartrate});
    }
    handleRedirectUri = (urlString)=>
    {
        const url = new URL(urlString, true);
        const {code} = url.query;
        const inccode = code;
        console.log(inccode);
        const le_id ="6f9197c9e7e54ed28f80d181cff3dfd4"; 
        const le_secret ="844c65be1b0f43fea7adc0f95f8dd0b8"; 
        const data = qs.stringify({
                grant_type:"authorization_code", 
                code:inccode,
                redirect_uri:'heartbeat://authorize',
                client_id:le_id,
                client_secret:le_secret
        });
        const headers = {
            'Content-Type':'application/x-www-form-urlencoded',
            //'Authorization': 'Basic '+Buffer.from(`${client_id}:${clientSecret}`).toString('base64'),
        }; 
        axios.post( 
            "https://accounts.spotify.com/api/token", 
            data,
            headers
        ).then((response)=> {
            console.log(response.data.access_token);
            this.setState({...this.state, pre_process_done:true, access_token:response.data.access_token});
        }).catch(function (error) {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
            } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(error.request);
            } else {
              // Something happened in setting up the request that triggered an Error
                //  console.log('Error', error.message);
            }
            console.log(error.config);
                });    
    }
    handleAuth = ()=>{
        const config={
            client_id:"6f9197c9e7e54ed28f80d181cff3dfd4",
            clientSecret:"844c65be1b0f43fea7adc0f95f8dd0b8",
            response_type: 'code',
            redirect_uri:'heartbeat://authorize',
            scope:'user-read-playback-state playlist-modify-public user-read-currently-playing user-modify-playback-state',
            auth_endpoint:'https://accounts.spotify.com/authorize'
        };
        const {client_id, auth_endpoint, redirect_uri, response_type, scope, } = config;
        const params = {client_id, redirect_uri, response_type, scope,};
        const authorizationUrl = auth_endpoint + "?" + qs.stringify(params);
        Linking.openURL(authorizationUrl);
    }
    componentDidMount(){
        Linking.getInitialURL().then(url => {
            if (url) this.handleRedirectUri(url);
        });
        this.subscription = DeviceEventEmitter.addListener("onHeartrate", this.handleHeartrateChange);
            this.dumbHRgenerator(true);

    }
    componentWillUnmount(){
           this.subscription.remove();
            this.dumbHRgenerator(false);
    }
    componentDidUpdate(){
        if(this.state.pre_process_done === true  )
        {
            this.setState({...this.state, pre_process_done:false});
            console.log("processing done, sending request for user profile");
            axios.get("https://api.spotify.com/v1/me", { headers: {Authorization:"Bearer "+this.state.access_token}})
                .then(response=>{
                    const data = JSON.stringify({
                            name:"heartBeat-playlist", 
                            description:"a playlist for your heartbeat"
                    });
                    const headers = {
                        'Content-Type':'application/json',
                        'Authorization':'Bearer '+this.state.access_token
                    }; 
                    axios.post(
                        `https://api.spotify.com/v1/users/${response.data.id}/playlists`,
                        data,
                        {headers: headers}
                    ).then(playlist=>{
                        this.setState({...this.state, playlist_id:playlist.data.id})
                        console.log(this.state);
                    }).catch(error=>{
                        console.log(error);
                        });    

                }).catch(function (error){ 
                    if (error.response) {
                      // The request was made and the server responded with a status code
                      // that falls out of the range of 2xx
                      console.log(error.response.data);
                      console.log(error.response.status);
                      console.log(error.response.headers);
                    } else if (error.request) {
                      // The request was made but no response was received
                      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                      // http.ClientRequest in node.js
                      console.log(error.request);
                    } else {
                      // Something happened in setting up the request that triggered an Error
                      console.log('Error', error.message);
                    }
                    console.log(error.config);
                        });    
        }
    }
  render() {
    return (
        <View style = {styles.container}> 
            <View style={styles.container}>
                <Text style={styles.instructions}>{this.state.dummyheartrate}</Text>
                <Button title={"login to spotify"} onPress={this.handleAuth} />
            </View>
            <Buttoncluster access_token={this.state.access_token} playlist_id = {this.state.playlist_id} heartrate = {this.state.dummyheartrate}/>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
