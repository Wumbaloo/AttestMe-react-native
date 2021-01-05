import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { Avatar, Button, Card, Title, List } from 'react-native-paper';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChooseReason from '../components/ChooseReason';
import GenerateAttestPopup from '../components/GenerateAttestPopup';
import { reasons } from '../assets/reasons';

const LeftContent = props => <Avatar.Icon {...props} icon="account" />

const AttestTab = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);
  const [checkboxSelected, setCheckboxSelected] = useState(false);

  useEffect(() => {
      getProfiles();
    // profileStore.subscribe(() => console.log(profileStore.getState()));
  }, []);

  const getProfiles = async () => {
    // try {
      const value = await AsyncStorage.getItem('profiles');
      if (value !== null) {
        let obj = JSON.parse(value);
        let copy = [{}];
        obj.forEach((element, index) => {
          for (let key of Object.keys(element))
            copy[index][key] = element[key];
        });
        // profileStore.dispatch({ type: 'set', profiles: copy });
        // profilesSetter(copy);
        setProfiles(copy);
        setCheckboxSelected(!checkboxSelected);
      }
    // } catch (e) {
    //   ToastAndroid.show("Impossible de récupérer vos profils.", ToastAndroid.LONG);
    // }
  }

  const renderReasons = (profile) => {
    return (
      profile.reasons.map((element) => {
        return (
          <List.Item
            key={element}
            title={ reasons[element] }
            left={props => <List.Icon {...props} icon="circle" style={{ margin: 0 }} />}
            style={{ paddingVertical: 0 }}
          />
        )
      })
    )
  };

  const profilesCards = profiles.map((profile, index) => {
    return (
      <Card key={index}>
        <Card.Title title={ profile['name.first'] + ' ' + profile['name.last']} left={LeftContent} />
        <Card.Content>
          <>
            { !profile.reasons || (profile.reasons && profile.reasons.length === 0)
            ?
              <Title>Sélectionnez un motif de déplacement.</Title>
            :
              <>
              <Title>Déplacement pour :</Title>
              {renderReasons(profile)}
              </>
            }
          </>
        </Card.Content>
        <Card.Actions style={{ display: "flex", justifyContent: "space-around" }}>
          <GenerateAttestPopup profile={ profile } onConfirm={ (profiles) => setProfiles(profiles) }></GenerateAttestPopup>
          <ChooseReason profile={ profile } onCheckboxSelected={ () => setCheckboxSelected(!checkboxSelected) } onConfirm={ (profiles) => setProfiles(profiles) }></ChooseReason>
        </Card.Actions>
      </Card>
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      { !profiles || profiles.length === 0
      ?
        <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
          <Title>Avant tout, créez vous un profil.</Title>
          <Button onPress={() => navigation.navigate('Profils') }>Créer mon profil</Button>
        </View>
      :
        <ScrollView>
          { profilesCards }
        </ScrollView>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

export default AttestTab;