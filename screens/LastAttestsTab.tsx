import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { Avatar, Button, Card, Title, Colors } from 'react-native-paper';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openPDF } from '../components/pdfUtils';

const LeftContent = props => <Avatar.Icon {...props} icon="account" />

const LastAttestsTab = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    getProfiles();
  }, []);

  const getProfiles = async () => {
    try {
      const value = await AsyncStorage.getItem('profiles');
      if (value !== null) {
        let obj = JSON.parse(value);
        let copy = [{}];
        obj.forEach((element, index) => {
          for (let key of Object.keys(element)) {
            if (key === "attests")
              copy[index][key] = JSON.parse(element[key]);
            else
              copy[index][key] = element[key];
          }
        });
        console.log(copy);
        setProfiles(copy);
      }
    } catch (e) {
      ToastAndroid.show("Impossible de récupérer vos profils.", ToastAndroid.LONG);
    }
  }

  const openAttest = (filename) => {
    let result = openPDF(filename);

    if (!result)
      ToastAndroid.show("Impossible de trouver l'attestation. Peut-être l'avez-vous supprimé ?", ToastAndroid.LONG);
      // @TODO: Delete attest if can't find
  };

  const renderAttests = (attests) => {
    return (
      attests.map((element, index) => {
        return (
          <View
            key={index}
            style={ styles.attestView }
          >
            <Text>Le { element.createdDate }</Text>
            <Text>Attestation crée à { element.createdTime }</Text>
            <Button
              mode="contained"
              color={ Colors.blue600 }
              dark
              style={{ marginVertical: 8}}
              onPress={ () => openAttest(element.title) }
            >
              Ouvrir l'attestation
              </Button>
          </View>
        )
      })
    )
  };

  const attestsCards = profiles.map((profile, index) => {
    return (
      <Card key={index}>
        <Card.Title title={ profile['name.first'] + ' ' + profile['name.last']} left={LeftContent} />
        <Card.Content>
          <>
            { !profile.attests || (profiles.attests && profiles.attests.length) === 0
              ?
              <View style={{ flex: 1, justifyContent: "center", alignContent: "center", backgroundColor: "transparent" }}>
                <Title>Ce profil ne possède pas d'attestations.</Title>
                <Button onPress={() => navigation.navigate('Attestations') }>Générer une attestation</Button>
              </View>
            :
              <>
                { renderAttests(profile['attests']) }
              </>
            }
          </>
        </Card.Content>
        <Card.Actions style={{ display: "flex", justifyContent: "space-around" }}>
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
        <ScrollView style={{ width: "90%" }}>
          { attestsCards }
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
  attestView: {
    backgroundColor: "transparent",
    borderColor: "rgba(122, 122, 122, 0.5)",
    borderWidth: 1,
    marginVertical: 4,
    padding: 8
  }
});

export default LastAttestsTab;