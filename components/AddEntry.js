import React, {Component} from 'react'
import { View, TouchableOpacity, Text, Platform, StyleSheet } from 'react-native'
import { getMetricMetaInfo, timeToString, getDailyReminderValue, clearLocalNotification, setLocalNotification } from '../utils/helpers'
import Slide from './Slide'
import Stepper from './Stepper'
import DateHeader from './DateHeader'
import { Ionicons } from '@expo/vector-icons'
import TextButton from './TextButton'
import { submitEntry, removeEntry} from '../utils/api'
import { connect } from 'react-redux'
import { addEntry }from '../actions'
import { white, purple } from '../utils/colors'
import { NavigationActions } from 'react-navigation'



function SubmitBtn({ onPress }){
  return (
    <TouchableOpacity
      style={Platform.OS === 'ios' ? styles.iosSubmitBtn : styles.androidSubmitBtn}
      onPress={onPress}>
    <Text style={styles.submitBtnText}>
      SUBMIT
    </Text>
  </TouchableOpacity>
  )
}


class AddEntry extends Component {

  state = {
    bike: 0,
    run: 0,
    swim: 0,
    sleep: 0,
    eat: 0,
  }
   increment = (metric) => {

    const { max, step } = getMetricMetaInfo(metric)

    this.setState((state) => {
      const count = state[metric] + step

      return {
        ...state,
        [metric] : count > max ? max : count
      }

    })
  }

   decrement = (metric) => {
    this.setState((state) => {
      const count = state[metric] - getMetricMetaInfo(metric).step

      return {
        ...state,
        [metric] : count < 0 ? 0 : count
      }

    })
  }

   slide = (metric, value) => {
    this.setState(() => ({
      [metric] : value
    }))
  }

  submit = () => {
    const key = timeToString()
    const entry = this.state

    this.setState(() => ({
      bike: 0,
      run: 0,
      swim: 0,
      sleep: 0,
      eat: 0,
    }))

    this.props.dispatch(addEntry({
      [key]: entry
    }))

    this.toHome()
    //save it to db
    submitEntry({key, entry});

    clearLocalNotification()
      .then(setLocalNotification)

    //clear the notification


  }

  reset = () => {
    const key = timeToString();

    this.props.dispatch(addEntry({
      [key]: getDailyReminderValue()
    }))


    this.toHome()
    //update to db
    removeEntry(key)

  }

  toHome = () => {
    this.props.navigation.dispatch(NavigationActions.back({
      key: 'AddEntry'
    }))
  }


  render(){

    const metaInfo = getMetricMetaInfo();
    if (this.props.alreadyLogged){
      return (
        <View style={styles.center}>
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-happy-outline' : 'md-happy'}
            size={100}
            />
          <Text>
            You already logged your information for today
          </Text>
          <TextButton style={{padding: 10}} onPress={this.reset}>
            <Text>
              Reset
            </Text>
          </TextButton>

        </View>
      )
    }
    return(
      <View style={styles.container}>
        <DateHeader
          date={(new Date()).toLocaleDateString()}
          />
        {Object.keys(metaInfo).map(key => {
          const { getIcon, type, ...rest } = metaInfo[key]
          const value = this.state[key]

          return(
            <View style={styles.row} key={key}>
              {getIcon()}
              {type === 'slider'
               ? <Slide
                  value={value}
                  onChange={(value) => {
                   this.slide(key, value)
                 }}
                 {...rest}
                 />
               : <Stepper
                   value={value}
                   onIncrement={() => {this.increment(key)}}
                   onDecrement={() => {this.decrement(key)}}
                   {...rest}
                 />
              }
            </View>
          )

        })}
        <SubmitBtn onPress={this.submit}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    padding: 20,
    backgroundColor: white,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  iosSubmitBtn: {
    backgroundColor: purple,
    padding: 10,
    borderRadius: 7,
    height: 45,
    marginLeft: 40,
    marginRight: 40,
  },
  androidSubmitBtn: {
    backgroundColor: purple,
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    height: 45,
    borderRadius: 2,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitBtnText: {
    color: white,
    fontSize: 22,
    textAlign: 'center'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 30,
    marginLeft: 30,
    }
})

function mapStateToProps(state){
  const key = timeToString()
  return {
    alreadyLogged: state[key] && typeof state[key].today === 'undefined'
  }

}

export default connect(mapStateToProps)(AddEntry)
