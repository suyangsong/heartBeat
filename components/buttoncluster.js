import React, {Component} from 'react';
import {TouchableNativeFeedback, Button, Platform, StyleSheet, Text, View, Linking} from 'react-native';
import qs from 'qs';
import URL from 'url-parse';
import axios from 'axios';



export default class Buttoncluster extends Component<Props> {

    state = {
        button_labels:[
            "deephouse",
            "top-50",
            "EDM",
            "metal-core",
            "running",
            "hip-hop",
        ],
        button_colors:[
            "#ffc500",
            "#f49ac0",
            "#479eeb",
            "#87c2ea",
            "#998fff",
            "#4649ec"
        ],
        genre_seed:[
            "deep-house",
            "pop",
            "edm",
            "metalcore",
            "funk",
            "hip-hop"
        ],
        current_seed:"anime"
    };
        stablizer=0;
        accumulator=0;
        updatenum=0;

    componentDidUpdate(prevProps, prevState){
       if (Math.abs(this.props.dummyheartrate - prevProps.dummyheartrate) > 5 )
       {
           this.accumulator++;
           if(this.accumulator>5)
           {
                console.log("large change detected");
                this.stablizer=0;
                this.RequestNextSong();

           }
       }   
        else
        {
            if (Math.abs(this.props.dummyheartrate - prevProps.dummyheartrate) < 5 )
         {
            this.stablizer++;
            if(this.stablizer == 3)
            {
                console.log("heartrate stabilized");
                this.accumulator = 0;
            }
         }
        }
           
    };

    RequestNextSong = () =>
    {
        this.accumulator=0;
        const data = qs.stringify({
            limit:1, 
            target_tempo:this.props.dummyheartrate,
            seed_genres:this.state.current_seed,
            min_danceability:0.5,
            market:"CA"
        });
        const headers = {
            'Authorization':'Bearer '+this.props.access_token
        }; 
       console.log(data);
       console.log(headers);
        axios.get(
            `https://api.spotify.com/v1/recommendations?${data}`,
            {
             headers:headers
            }
        ).then(recdata=>{
            this.setState({...this.state, rec_uri:recdata.data.tracks[0].uri})
            this.AddtoPlaylist();
            console.log(this.state);
        }).catch(error=>{
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

    };

    AddtoPlaylist = ()=>
    {
        if(this.props.playlist_id)
        {
            const data = qs.stringify({
                    uris:this.state.rec_uri
            });
            const headers = {
                'Content-Type':'application/json',
                'Authorization':'Bearer '+this.props.access_token
            }; 
            const empty ={};
            axios.post(
                `https://api.spotify.com/v1/playlists/${this.props.playlist_id}/tracks?${data}`,
                empty,
                {headers: headers}
            ).then(response=>{
                console.log(response);
                this.updatenum++;
                if(this.updatenum !=1)
                {
                    let counter = setTimeout(()=>this.SkiptoNextTrack(),1000);
                }
            }).catch(error=>{
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
    };
    SkiptoNextTrack = ()=>{
            const headers = {
                'Authorization':'Bearer '+this.props.access_token
            }; 
            axios.post(
                `https://api.spotify.com/v1/me/player/next`,
                undefined,
                {headers: headers})
                .then(response=>{
                })
                .catch(error=>{
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
    handlegenrechange = (genre)=> {
        this.setState({...this.state, current_seed:genre })
        console.log("genre changed! current genre: "+genre);

    }
    render(){
    return(
            <View style={styles.container}>
                {this.state.button_labels.map((label, index) =>
                        <Categorybutton 
                            key = {label}
                            btnlabel = {label}
                            color='white'
                            dummyhr = {this.props.dummyheartrate}
                            genrechange = {this.handlegenrechange}
                            btn_color={this.state.button_colors[index]}
                            genre_seed={this.state.genre_seed[index]}
                        />       
                )
                } 
            </View>
    );
    }
}

class Categorybutton extends Component<Props>{
    

    render(){
        return(
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple('#000000', false)}
                onPress={()=>{this.props.genrechange(this.props.genre_seed)}}
            >
                <View style = {{
                    width:115,
                    height:115,
                    margin:8,
                    borderRadius:4, 
                    backgroundColor: this.props.btn_color,
                    alignItems:'center',
                    justifyContent:'center'
                    }}>
                    <Text style ={{
                        color:this.props.color,
                        fontSize:25,
                        textAlign:'center',
                        fontWeight:'bold'
                    }}> {this.props.btnlabel} </Text>
                </View>
            </TouchableNativeFeedback>   
        );
    }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap:'wrap',
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
