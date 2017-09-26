import React, {Component} from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { getMetricMetaInfo, timeToString } from '../utils/helpers'
import Slide from './Slide'
import Stepper from './Stepper'
import DateHeader from './DateHeader'
import { Ionicons } from '@expo/vector-icons'
import TextButton from './TextButton'

function SubmitBtn({ onPress }){
  return (
    <TouchableOpacity onPress={onPress}>
    <Text>
      SUBMIT
    </Text>
  </TouchableOpacity>
  )
}

export default class AddEntry extends Component {

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
    //update Redux

    //navigate to Home

    //save it to db

    //clear the notification


  }

  reset = () => {
    const key = timeToString();

    //update Redux

    //Route to Home

    //update to db

  }

  render(){

    const metaInfo = getMetricMetaInfo();
    if (this.props.alreadyLogged){
      return (
        <View>
          <Ionicons
            name='ios-happy-outline'
            size={100}
            />
          <Text>
            You already logged your information for today
          </Text>
          <TextButton onPress={this.reset}>
            <Text>
              Reset
            </Text>
          </TextButton>

        </View>
      )
    }



    return(
      <View>
        <DateHeader
          date={(new Date()).toLocaleDateString()}
          />
        {Object.keys(metaInfo).map(key => {
          const { getIcon, type, ...rest } = metaInfo[key]
          const value = this.state[key]

          return(
            <View key={key}>
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
