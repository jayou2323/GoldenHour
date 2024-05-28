import { AppState, Platform, Modal, Animated, StyleSheet,
     View, Image, Dimensions, SafeAreaView, 
     Alert} from 'react-native';
import {wScale, hScale, SCREEN_WIDTH, SCREEN_HEIGHT} from '../../utils/scaling';
import RegularText from '../../component/ui/regular-text'
import react, {useEffect,useRef, useState} from 'react';
import CircleButton from '../../component/ui/buttons/circle-button';
import Success from '../../../src/assets/success.png';
import Fail from '../../../src/assets/fail.png';
import ModalBtn from '../../component/ui/buttons/modal-button';
import { useSelector, useDispatch } from 'react-redux';
import {setSavedWashingTime} from '../../stores/ready-time-slice'
import { useNavigation } from '@react-navigation/native';

export default function Shower(){
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current); 

    // 옷입고 준비하기에서 아낀 시간
    const savedEtcTime = useSelector((state) => state.readyTime.savedEtcTime);
    // 씻기를 완료한 시점(ms)
    const washingCompletedTime = useSelector((state) => state.readyTime.washingCompletedTime);
    const etcCompletedTime = useSelector((state) => state.readyTime.etcCompletedTime);

    const [timeLeft, setTimeLeft] = useState();
    const [time, setTime] = useState(Math.floor((washingCompletedTime - new Date().getTime())/(1000)) - savedEtcTime);
    const [isRunning, setIsRunning] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [failModalOpen, setFailModalOpen] = useState(false);
    animatedValue = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();

    const dispatch = useDispatch();

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
          if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active'
          ) {
            console.log('App has come to the foreground!');
          }
    
          appState.current = nextAppState;
          setAppStateVisible(appState.current);
          console.log('AppState', appState.current);
        });

        navigation.addListener('beforeRemove', (e) => {
            // Prevent default behavior of leaving the screen
            e.preventDefault();
    
            // Prompt the user before leaving the screen
            Alert.alert(
              '준비를 그만두시겠습니까?',
              '아직 준비를 완료하지 않으셨어요. 되돌아가시겠습니까?',
              [
                { text: "계속하기", style: 'cancel', onPress: () => {} },
                {
                  text: '그만두기',
                  style: 'destructive',
                  // If the user confirmed, then we dispatch the action we blocked earlier
                  // This will continue the action that had triggered the removal of the screen
                  onPress: () => navigation.dispatch(e.data.action),
                },
              ]
            );
        });
    
        return () => {
          subscription.remove();
          navigation.removeListener();
        };
      }, []);

    
    useEffect(() => {
        let interval;
        // let interval2;
        if (isRunning){
            Animated.timing(animatedValue, {
            toValue: SCREEN_HEIGHT,
            duration: time * 1000 ,
            useNativeDriver: false,
        }).start();
        interval = setInterval(() => {
            setTime((prevTime) => {
                if(prevTime <= 1){
                    clearInterval(interval);
                    setIsRunning(false);
                    autoModalOpen();
                    return 0;
                }
                const remain = 
                    (Math.floor((washingCompletedTime - new Date().getTime())/(1000)) - savedEtcTime);
                return remain > 0 ? remain : 0;
            });
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }
    }, [isRunning]);
    

    const onPressModalOpen = () => {
        setModalOpen(true);
        setIsRunning(false);
        setTimeLeft(time);
        Animated.timing(animatedValue).stop();
    }

    const autoModalOpen = () => {
        setFailModalOpen(true);
    }
    
    const onPressModalClose = () => {
        setModalOpen(false);
        setFailModalOpen(false);
    }

    const formattedTime = (time) => {
        const hour = Math.floor(time / 3600);
        const remainingSeconds = time % 3600;
        const minute = Math.floor(remainingSeconds / 60);
        const second = remainingSeconds % 60
        
        return `${hour.toString().padStart(2, '0')} : ${minute.toString().padStart(2, '0')} : ${second.toString().padStart(2, '0')}`;
    }

    const formattedTime2 = (time) => {
        const minute = Math.floor(time / 60);
        const second = time % 60
        
        return `${minute.toString().padStart(1, '0')} 분 ${second.toString().padStart(1, '0')} 초`;
    }

    const onModalNext = () => {
        if(time > 0){
            dispatch(setSavedWashingTime(time));
        }
        onPressModalClose();
        // 옷입고 준비하기 완료할 시간이 이미 지났을 경우 moving 스크린으로 이동
        if((parseInt(etcCompletedTime) - new Date().getTime()) <= 0){
            navigation.navigate('Moving');
        } else {
            // 씻기가 옷입기보다 나중이라면 moving 스크린으로 이동
            // 씻기가 옷입기보다 먼저라면 Clothing 스크린으로 이동
            if(parseInt(washingCompletedTime) > parseInt(etcCompletedTime))
                navigation.navigate('Moving');
            else
                navigation.navigate('Clothing');
        }
    }

    return(
            <View style={styles.background}>
                <View style={styles.component}>
                    <RegularText style={styles.text}>지금은 씻는 시간 !</RegularText>
                    <RegularText style={styles.text1}>{formattedTime(time)}</RegularText>
                    <CircleButton children='완료' color="#7AF7FF" onPress={() => onPressModalOpen()}/>
                </View>
                <Animated.View style={[styles.colorback,{ height: animatedValue.interpolate({inputRange: [0, SCREEN_HEIGHT],outputRange: [0,SCREEN_HEIGHT],})}]} />
                {/*<View style={[styles.colorback, {height:SCREEN_HEIGHT * washingTimePersent}]} /> */}
                <Modal animationType='slide' visible = {modalOpen} transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalBack}/>
                    <View style={styles.modal}>
                        <Image source={Success} style={styles.img}></Image>
                        <RegularText style={styles.modalText}>{formattedTime2(time)} 아끼셨네요</RegularText>
                        <ModalBtn style={styles.btn}children='다음' onPress={onModalNext}/>
                    </View>
                    </View>
                </Modal>
                
                <Modal animationType='slide' visible = {failModalOpen} transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalBack}/>
                    <View style={styles.modal}>
                        <Image source={Success} style={styles.img}></Image>
                        <RegularText style={styles.modalText}>지각 예정이에요..!</RegularText>
                        <RegularText style={styles.modalText}>서둘러 주세요.</RegularText>
                        <ModalBtn style={styles.btn}children='다음' onPress={onModalNext}/>
                    </View>
                    </View>
                </Modal>
                
                
            </View>
    )
    
}
const styles = StyleSheet.create({
    background: {
        backgroundColor: "#FFFFFF",
        flex: 1,
        // width:'100%',
        // height: '100%',
        alignItems: 'center',
        flexDirection: 'column-reverse',
    },
    colorback: {
        backgroundColor: "#7AF7FF",
        // flex: 1,
        // width:hScale(SCREEN_HEIGHT),
        width: '100%',
        transition: '1s',
        zIndex: 1
    },
    text: {
        fontFamily: 'Pretendard-Bold',
        
    },
    text1: {
        fontFamily: 'Pretendard-Bold',
        marginBottom: hScale(300),
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
    modalContainer:{
        flex: 1,
        justifyContent:'center',
        alignItems: 'center'
    },
    modalBack:{
        position:'absolute',
        top:0,
        left:0,
        width:'100%',
        height: '100%',
        justifyContent:'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        opacity: .6,
        zIndex: 3
    },
    modal: {
        backgroundColor:'#FFFFFF',
        width: wScale(280),
        height: hScale(380),
        justifyContent:'center',
        alignItems:'center',
        borderRadius: wScale(20),
        zIndex: 6,
        opacity: 1,
    },
    modalText: {
        fontFamily:'Pretendard-Bold',
        fontSize: wScale(20)
    },
    img: {
        width: wScale(80),
        height: hScale(80),
        marginTop:hScale(80),
        marginBottom:hScale(20)
    },
    btn: {
        marginTop:hScale(80)
    }
})