// App.js - ReciTech (MVP) - Landing + Auth + Upload + Finance + IA-ready
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { LineChart } from "react-native-chart-kit";

// Exemplo no código do Frontend
const API_URL = "https://recitech-backend.onrender.com";
const screenWidth = Dimensions.get("window").width - 40;

// ===== COMPONENTS =====

function LandingPage({ onStart, openB2B }) {
  return (
    <ScrollView contentContainerStyle={[styles.container, {justifyContent:'center'}]}>
      <View style={styles.card}>
        <Text style={styles.landingTitle}>ReciTech</Text>
        <Text style={styles.landingSubtitle}>Transformando dúvidas em descarte correto com IA</Text>

        <View style={styles.howItWorks}>
          <View style={styles.howStep}>
            <Text style={styles.howStepNum}>1</Text>
            <Text style={styles.howStepTitle}>Escaneie</Text>
            <Text style={styles.howStepText}>Tire uma foto do resíduo. A IA identifica o material.</Text>
          </View>
          <View style={styles.howStep}>
            <Text style={styles.howStepNum}>2</Text>
            <Text style={styles.howStepTitle}>Pontue</Text>
            <Text style={styles.howStepText}>Acumule pontos e receba feedback para descarte correto.</Text>
          </View>
          <View style={styles.howStep}>
            <Text style={styles.howStepNum}>3</Text>
            <Text style={styles.howStepTitle}>Descarte</Text>
            <Text style={styles.howStepText}>Encontre o ponto de coleta mais próximo.</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.button, {marginTop:10, paddingVertical:14}]} onPress={onStart}>
          <Text style={styles.buttonText}>Quero testar a IA agora</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{marginTop:12}} onPress={openB2B}>
          <Text style={{color:'#228B22', textDecorationLine:'underline'}}>Informações para empresas / cooperativas</Text>
        </TouchableOpacity>

        <Text style={{marginTop:18, color:'#666', fontSize:12, textAlign:'center'}}>
          MVP · ReciTech — teste a detecção e gere relatórios financeiros e de créditos de carbono.  
        </Text>
      </View>
    </ScrollView>
  );
}

function LoginScreen({ email, setEmail, password, setPassword, login, loading, setScreen, emailRef, passwordRef }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={styles.card}>
      <Text style={styles.title}>Entrar</Text>
      <TextInput
        ref={emailRef} placeholder="Email" value={email} onChangeText={setEmail}
        style={styles.input} autoCapitalize="none" autoCorrect={false}
        keyboardType="email-address" onSubmitEditing={()=>passwordRef.current.focus()}
      />
      <TextInput
        ref={passwordRef} placeholder="Senha" value={password} onChangeText={setPassword}
        style={styles.input} secureTextEntry autoCapitalize="none" autoCorrect={false}
        onSubmitEditing={login}
      />
      <TouchableOpacity style={styles.button} onPress={login}>
        {loading?<ActivityIndicator color="#fff"/>:<Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>setScreen("register")}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function RegisterScreen({ email, setEmail, password, setPassword, cpfValue, handleCPFChange, register, loading, setScreen, emailRef, cpfRef, passwordRef }) {
  return (
    <ScrollView contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Cadastro</Text>
      <TextInput ref={emailRef} placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" autoCorrect={false} keyboardType="email-address"/>
      <TextInput ref={cpfRef} placeholder="CNPJ/CPF" value={cpfValue} onChangeText={handleCPFChange} style={styles.input} keyboardType="numeric"/>
      <TextInput ref={passwordRef} placeholder="Senha" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry autoCapitalize="none" autoCorrect={false}/>
      <TouchableOpacity style={styles.button} onPress={register}>
        {loading?<ActivityIndicator color="#fff"/>:<Text style={styles.buttonText}>Cadastrar</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>setScreen("login")}>
        <Text style={styles.linkText}>Já tem conta? Faça login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function UploadGalleryScreen({ image, setImage, pickImage, takePhoto, uploadPhoto, loading, photos, filterClass, setFilterClass, classificationResult }) {
  const filteredPhotos = filterClass ? photos.filter(p=>p.type===filterClass) : photos;

  const renderItem = ({item}) => (
    <View style={styles.photoCard}>
      <Image source={{ uri:`${API_URL}/uploads/${encodeURIComponent(item.filename)}` }} style={styles.thumbnail}/>
      <Text style={styles.photoLabel}>{item.type || "Desconhecido"}</Text>
      <Text style={styles.photoClass}>R$ {(item.pricePerKg || 0).toFixed(2)} /kg</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Upload & Galeria</Text>
      <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
        <TouchableOpacity style={[styles.button, {flex:1, marginRight:5, backgroundColor:'#32CD32'}]} onPress={pickImage}><Text style={styles.buttonText}>Galeria</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, {flex:1, marginLeft:5, backgroundColor:'#1E90FF'}]} onPress={takePhoto}><Text style={styles.buttonText}>Câmera</Text></TouchableOpacity>
      </View>

      {image && <Image source={{ uri:image.uri }} style={styles.previewImage}/>}
      {image && (
        <View style={{width:'100%', alignItems:'center'}}>
          <TouchableOpacity style={[styles.button,{backgroundColor:'#006400', width:'100%'}]} onPress={uploadPhoto}>
            {loading?<ActivityIndicator color="#fff"/>:<Text style={styles.buttonText}>Enviar Foto</Text>}
          </TouchableOpacity>
          {classificationResult ? (
            <View style={{marginTop:10, padding:10, backgroundColor:'#f1fdf1', borderRadius:8, width:'100%'}}>
              <Text style={{fontWeight:'bold'}}>Classificação IA:</Text>
              <Text>{classificationResult.label || 'Desconhecido'} ({Math.round((classificationResult.confidence||0)*100)}%)</Text>
            </View>
          ) : null}
        </View>
      )}

      <Text style={{marginTop:20,fontWeight:'bold'}}>Filtro por Tipo:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:10}}>
        {['','Plástico','Metal','Vidro','Papel','desconhecido'].map(c=>(
          <TouchableOpacity key={c} style={[styles.filterButton, filterClass===c && {backgroundColor:'#228B22'}]} onPress={()=>setFilterClass(c)}>
            <Text style={{color:'#fff', fontSize:12}}>{c || 'Todos'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPhotos}
        renderItem={renderItem}
        keyExtractor={item=>item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginVertical:10}}
      />
    </ScrollView>
  );
}

function FinanceHubScreen({ materials, setMaterials }) {
  const [materialName, setMaterialName] = useState("");
  const [materialQty, setMaterialQty] = useState("");
  const [materialPrice, setMaterialPrice] = useState("");

  const addMaterial = ()=>{
    if(materialName && materialQty && materialPrice){
      setMaterials(prev=>[...prev,{id:Date.now().toString(), name:materialName, qty:parseFloat(materialQty), price:parseFloat(materialPrice)}]);
      setMaterialName(""); setMaterialQty(""); setMaterialPrice("");
    }
  };

  const editMaterial = (id)=>{
    const m = materials.find(m=>m.id===id);
    if(!m) return;
    Alert.prompt("Editar Material", "Atualize os dados separados por vírgula: nome,quantidade,preço", [
      { text:"Cancelar" },
      { text:"Salvar", onPress:text=>{
        const [name, qty, price] = text.split(",");
        setMaterials(prev=>prev.map(mat=>mat.id===id?{...mat,name:name.trim(),qty:parseFloat(qty),price:parseFloat(price)}:mat));
      }}
    ], "plain-text", `${m.name},${m.qty},${m.price}`);
  };

  const removeMaterial = (id)=>{
    setMaterials(prev=>prev.filter(m=>m.id!==id));
  };

  const totalValue = materials.reduce((sum,m)=>sum + m.qty*m.price,0);
  const totalCarbonCredits = materials.reduce((sum,m)=>sum + m.qty*0.1,0);

  return (
    <ScrollView contentContainerStyle={styles.card}>
      <Text style={styles.title}>Hub Financeiro</Text>

      <Text style={{fontWeight:'bold'}}>Adicionar Material</Text>
      <TextInput placeholder="Nome do Material" style={styles.input} value={materialName} onChangeText={setMaterialName}/>
      <TextInput placeholder="Quantidade (kg)" style={styles.input} value={materialQty} onChangeText={setMaterialQty} keyboardType="numeric"/>
      <TextInput placeholder="Valor por kg" style={styles.input} value={materialPrice} onChangeText={setMaterialPrice} keyboardType="numeric"/>
      <TouchableOpacity style={styles.button} onPress={addMaterial}>
        <Text style={styles.buttonText}>Adicionar</Text>
      </TouchableOpacity>

      <Text style={{marginTop:20,fontWeight:'bold'}}>Materiais Cadastrados</Text>
      {materials.map(mat=>(
        <View key={mat.id} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:5}}>
          <Text>{mat.name} - {mat.qty}kg x R$ {mat.price.toFixed(2)}</Text>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity onPress={()=>editMaterial(mat.id)} style={{marginRight:5}}>
              <Text style={{color:'#1E90FF'}}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>removeMaterial(mat.id)}>
              <Text style={{color:'#FF0000'}}>Remover</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={{marginTop:20,fontWeight:'bold'}}>Resumo Financeiro</Text>
      <Text>Total Valor: R$ {totalValue.toFixed(2)}</Text>
      <Text>Créditos de Carbono: {totalCarbonCredits.toFixed(2)} pts</Text>

      <LineChart
        data={{
          labels: materials.map(m=>m.name),
          datasets: [{ data: materials.map(m=>m.qty*m.price) }]
        }}
        width={screenWidth} height={220}
        yAxisLabel="R$"
        chartConfig={{
          backgroundColor:"#228B22",
          backgroundGradientFrom:"#32CD32",
          backgroundGradientTo:"#228B22",
          decimalPlaces:2,
          color:(opacity=1)=>`rgba(255,255,255,${opacity})`,
          labelColor:(opacity=1)=>`rgba(255,255,255,${opacity})`,
          style:{borderRadius:16},
          propsForDots:{r:"6", strokeWidth:"2", stroke:"#fff"}
        }}
        style={{marginVertical:10,borderRadius:16}}
      />
    </ScrollView>
  );
}

// ===== APP PRINCIPAL =====
export default function App() {
  const [screen,setScreen] = useState("landing"); // landing, login, register, upload, finance
  const [token,setToken] = useState(null);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [cpf,setCpf] = useState("");
  const [cpfValue,setCpfValue] = useState("");
  const [image,setImage] = useState(null);
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");
  const [photos,setPhotos] = useState([]);
  const [filterClass,setFilterClass] = useState('');
  const [materials,setMaterials] = useState([]);
  const [classificationResult,setClassificationResult] = useState(null);
  const [showB2B, setShowB2B] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const emailRef = useRef(null);
  const cpfRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(()=>{
    const loadToken = async ()=>{
      const t = await AsyncStorage.getItem("token");
      if(t){ setToken(t); setScreen("upload"); fetchPhotos(t); }
    };
    loadToken();
  },[]);

  const showMessage = (msg)=>{
    setMessage(msg);
    Animated.sequence([
      Animated.timing(fadeAnim,{toValue:1,duration:300,useNativeDriver:true}),
      Animated.delay(2000),
      Animated.timing(fadeAnim,{toValue:0,duration:300,useNativeDriver:true}),
    ]).start();
  };

  const handleCPFChange = (text)=>{
    const cleaned = text.replace(/\D/g,"").slice(0,14);
    setCpfValue(cleaned); setCpf(cleaned);
  };

  // ===== Auth =====
  const login = async ()=>{
    if(!email||!password){ showMessage("Preencha todos os campos."); return;}
    setLoading(true);
    try{
      const res = await fetch(`${API_URL}/login`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const data = await res.json();
      if(data.success){
        setToken(data.accessToken);
        await AsyncStorage.setItem("token",data.accessToken);
        setScreen("upload");
        fetchPhotos(data.accessToken);
        showMessage("Login realizado!");
      } else showMessage(data.error||"Falha no login");
    }catch{ showMessage("Erro de conexão"); }
    finally{ setLoading(false); }
  };

  const register = async ()=>{
    if(!email||!password||!cpf){ showMessage("Preencha todos os campos."); return;}
    setLoading(true);
    try{
      const res = await fetch(`${API_URL}/register`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password,cnpj:cpf}) });
      const data = await res.json();
      if(data.success){ showMessage("Cadastro realizado!"); setScreen("login"); }
      else showMessage(data.error||"Falha no cadastro");
    }catch{ showMessage("Erro de conexão"); }
    finally{ setLoading(false); }
  };

  // ===== Image pick / upload =====
  const pickImage = async ()=>{
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status!=="granted"){ showMessage("Permissão necessária!"); return;}
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes:ImagePicker.MediaTypeOptions.Images, allowsEditing:true, aspect:[4,3], quality:0.8 });
    if(!result.canceled && result.assets?.length>0) setImage(result.assets[0]);
  };

  const takePhoto = async ()=>{
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if(status!=="granted"){ showMessage("Permissão necessária!"); return;}
    const result = await ImagePicker.launchCameraAsync({ allowsEditing:true, aspect:[4,3], quality:0.8 });
    if(!result.canceled && result.assets?.length>0) setImage(result.assets[0]);
  };

  const classifyMaterial = async (photoBase64) => {
    try {
      const res = await fetch(`${API_URL}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ photoBase64 })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return null;
    }
  };

  const uploadPhoto = async ()=>{
    if(!image){ showMessage("Selecione uma imagem."); return;}
    setLoading(true);
    setClassificationResult(null);
    try{
      const photoBase64 = await FileSystem.readAsStringAsync(image.uri,{encoding:'base64'});

      const classified = await classifyMaterial(photoBase64);
      if(classified){
        setClassificationResult(classified);
      }

      const res = await fetch(`${API_URL}/materials`,{
        method:'POST',
        headers:{
          'Authorization':`Bearer ${token}`,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          type: classified?.label || 'desconhecido',
          quantity: 1,
          pricePerKg: 0,
          photoBase64
        })
      });

      const data = await res.json();
      if(data.success){ showMessage("Upload realizado!"); setImage(null); fetchPhotos(token); }
      else showMessage(data.error||"Falha no upload");
    }catch(err){ showMessage("Erro no upload"); }
    finally{ setLoading(false); }
  };

  const fetchPhotos = async (t)=>{
    try{
      const res = await fetch(`${API_URL}/materials`,{ headers:{ 'Authorization':`Bearer ${t}`}});
      const data = await res.json();
      if(data.success) setPhotos(data.materials || []);
    }catch{}
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#E6F2EA'}}>
      {screen==="landing" && <LandingPage onStart={()=>setScreen("login")} openB2B={()=>setShowB2B(true)}/>}
      {screen==="login" && <LoginScreen {...{email,setEmail,password,setPassword,login,loading,setScreen,emailRef,passwordRef}} />}
      {screen==="register" && <RegisterScreen {...{email,setEmail,password,setPassword,cpfValue,handleCPFChange,register,loading,setScreen,emailRef,cpfRef,passwordRef}} />}
      {screen==="upload" && <UploadGalleryScreen {...{image,setImage,pickImage,takePhoto,uploadPhoto,loading,photos,filterClass,setFilterClass,classificationResult}} />}
      {screen==="finance" && <FinanceHubScreen {...{materials,setMaterials}} />}

      <Animated.View style={[styles.messageContainer,{opacity:fadeAnim}]}>
        <Text style={styles.messageText}>{message}</Text>
      </Animated.View>

      <Modal visible={showB2B} transparent animationType="slide">
        <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center'}}>
          <View style={[styles.card,{width:screenWidth+40}]}>
            <Text style={styles.title}>B2B / Cooperativas</Text>
            <Text>Para empresas e cooperativas, entre em contato via email: b2b@recitech.com</Text>
            <TouchableOpacity style={[styles.button,{marginTop:20}]} onPress={()=>setShowB2B(false)}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#E6F2EA"},
  card:{
    padding:20,
    marginHorizontal:10,
    marginVertical:10,
    backgroundColor:"#fff",
    borderRadius:15,
    shadowColor:"#000",
    shadowOpacity:0.12,
    shadowOffset:{width:0,height:3},
    shadowRadius:8,
    elevation:4,
    alignItems:"center",
    width: screenWidth
  },
  landingTitle:{fontSize:28,fontWeight:"900",color:"#0B7A34",marginBottom:6,textAlign:'center'},
  landingSubtitle:{fontSize:14,color:'#2b6b35',marginBottom:12,textAlign:'center'},
  howItWorks:{width:'100%'},
  howStep:{backgroundColor:'#f7fff7', padding:10, borderRadius:10, marginVertical:4},
  howStepNum:{width:32,height:32,borderRadius:16,backgroundColor:'#228B22',color:'#fff',textAlign:'center',lineHeight:32,fontWeight:'bold',alignSelf:'flex-start',marginBottom:4},
  howStepTitle:{fontWeight:'bold', fontSize:14},
  howStepText:{color:'#444', fontSize:12},
  title:{fontSize:22,fontWeight:"bold",color:"#228B22",marginBottom:8,textAlign:'center'},
  input:{width:"100%",borderWidth:1,borderColor:"#228B22",borderRadius:10,padding:10,marginBottom:10,backgroundColor:"#F9FFF9", fontSize:14},
  button:{padding:12,borderRadius:10,backgroundColor:"#228B22",alignItems:"center",marginBottom:8,width:'100%'},
  navButton:{padding:10,borderRadius:10,backgroundColor:"#32CD32",alignItems:"center",flex:1,marginHorizontal:3},
  buttonText:{color:"#fff",fontWeight:"bold",fontSize:16, textAlign:'center'},
  linkText:{color:"#228B22",marginTop:8,textDecorationLine:"underline", fontSize:14},
  previewImage:{width:screenWidth,height:screenWidth,borderRadius:10,marginVertical:12,borderWidth:1,borderColor:"#ccc", resizeMode:'cover'},
  messageContainer:{position:"absolute",bottom:50,left:10,right:10,backgroundColor:"#333",padding:12,borderRadius:10},
  messageText:{color:"#fff",textAlign:"center", fontSize:14},
  thumbnail:{width:80,height:80,borderRadius:8,marginRight:10, resizeMode:'cover'},
  photoCard:{alignItems:'center',marginRight:8, width:90},
  photoLabel:{fontWeight:'bold', fontSize:12, textAlign:'center'},
  photoClass:{color:'#555', fontSize:11, textAlign:'center'},
  filterButton:{paddingVertical:6,paddingHorizontal:12,backgroundColor:'#006400',borderRadius:8,marginRight:6, minWidth:60, alignItems:'center'}
});
