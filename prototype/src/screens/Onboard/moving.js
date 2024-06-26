import { Animated, StyleSheet, Text, View, Dimensions } from 'react-native';
import {wScale, hScale, SCREEN_HEIGHT} from '../../utils/scaling';
import RegularText from '../../component/ui/regular-text'
import {useEffect,useRef, useState} from 'react';
import CircleButton from '../../component/ui/buttons/circle-button';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

export default function Moving(){
    const arrival = useSelector((state) => state.time.arrival)

    const [remainTime, setRemainTime] = useState(Math.floor((arrival - new Date().getTime())/1000));
    const [time, setTime] = useState(Math.floor((arrival - new Date().getTime())/1000));
    const [isRunning, setIsRunning] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();
    const [isArrival, setIsArrival] = useState(true);
    const [pressedTime, setPressedTime] = useState(new Date().getTime());

    useEffect(() => {
        let interval;
        if (isRunning){
            Animated.timing(animatedValue, {
            toValue: SCREEN_HEIGHT,
            duration: remainTime * 1000, // 남은 시간 넣어야함. 
            useNativeDriver: false,
        }).start();
        interval = setInterval(() => {
            setTime((prevTime) => {
                return Math.floor((arrival - new Date().getTime()) / 1000);
            })
        }, 1000);
        return () => clearInterval(interval);
        
    }
    }, [isRunning]);

    const pressDepart = () => {
        setPressedTime(new Date().getTime());
        setIsArrival(false);
        setRemainTime(Math.floor((arrival - new Date().getTime())/1000));
        setIsRunning(true);
        // Animated.timing(animatedValue).stop();
    }
    
    const pressArrival = () => {
        if((arrival - new Date().getTime()) >= 0)
            navigation.navigate('Praise');
        else
            navigation.navigate('Disappoint');
    }

    const formattedTime = (time) => {
        time = time > 0 ? time : 0;
        const hour = Math.floor(time / 3600);
        const remainingSeconds = time % 3600;
        const minute = Math.floor(remainingSeconds / 60);
        const second = remainingSeconds % 60
        
        return `${hour.toString().padStart(2, '0')} : ${minute.toString().padStart(2, '0')} : ${second.toString().padStart(2, '0')}`;
    }
    const depart = () => {
        return(
            <View style={styles.BtnView}>
                <Text style={styles.BtnText1}>도착 버튼을</Text>
                <Text style={styles.BtnText2}>눌러주세요</Text>
                <CircleButton children='도착' color="#EDEDED" onPress={pressArrival}/>
            </View>
        )
    }

    return(
        <View style={styles.background}>
            <View style={styles.component}>
                <RegularText style={styles.text}>집에서 도착지로 ~~</RegularText>
                <RegularText style={styles.text1}>{formattedTime(time)}</RegularText>
                {isArrival ? <CircleButton children='출발' color="#FFFA7A" onPress={() => pressDepart()}/> : depart()}
            </View>
            <Animated.View style={[styles.colorback,{ height: animatedValue.interpolate({inputRange: [0, SCREEN_HEIGHT],outputRange: [0,SCREEN_HEIGHT],})}]} />    
        </View>
    )
    
}
const styles = StyleSheet.create({
    background: {
        backgroundColor: "#FFFFFF",
        flex: 1,
        width:'100%',
        height: '100%',
        alignItems: 'center',
        flexDirection: 'column-reverse',
    },
    colorback: {
        backgroundColor: "#FFFA7A",
        width:'100%',
        zIndex: 1
    },
    text: {
        fontFamily: 'Pretendard-Bold',
        
    },
    text1: {
        fontFamily: 'Pretendard-Bold',
        marginBottom: hScale(250),
        marginTop: hScale(20)
    },
    component : {
        position: 'absolute',
        flex: 1,
        bottom:hScale(100),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    
    BtnView: {
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    BtnText1: {
        fontSize: wScale(15),
        marginBottom: hScale(5),
        marginTop: hScale(-58),
        fontWeight: '600'
    },
    BtnText2: {
        fontSize: wScale(15),
        marginBottom: hScale(20),
        fontWeight: '600'
    }
})