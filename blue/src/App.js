import React, { Component } from 'react';
import fbobj from './firebase/';
import { Container, Header, Icon, Card, Image, Label, Statistic, Grid, Button, Dropdown, Loader } from 'semantic-ui-react';
import ReactPaginate from 'react-paginate';
import { translateData } from './data/pokemon';
import 'semantic-ui-css/semantic.min.css';
import './paginate.css';

const getlist = fbobj.db.ref('getlist');
const displayDropdown = [
  { text: '1', value: 1 },
  { text: '2', value: 2 },
  { text: '3', value: 3 },
  { text: '4', value: 4 },
  { text: '5', value: 5 },
  { text: '6', value: 6 },
  { text: '7', value: 7 },
  { text: '8', value: 8 },
  { text: '9', value: 9 },
];

class App extends Component {
  constructor() {
    super();
    this.state = {
      getlistArray: [],
      pageCurrent: 0,
      pageCount: 9,
      selectUser: '',
    };
  }
  componentDidMount() {
    this.updateAllList();
  }
  getLatestList = (cb) => {
    getlist.once('value').then((snapshot) => {
      const firebaseSnapshot = snapshot.val();
      return Object.keys(firebaseSnapshot).map((value) => {
        return firebaseSnapshot[value];
      });
    }).then((snapshot) => cb ? cb(snapshot) : null);
  }
  updateList = (snapshot) => {
    this.setState({
      getlistArray: snapshot.reverse(),
    });
  }
  updateAllList = () => {
    this.setState({
      getlistArray: [],
      pageCurrent: 0,
      selectUser: '',
    });
    this.getLatestList((snapshot) => {
      this.updateList(snapshot);
    });
  }
  updateUserList = () => {
    this.setState({ getlistArray: [] });
    this.getLatestList((snapshot) => {
      const userlist = snapshot.filter((element, index) => {
        return (element.user === this.state.selectUser);
      });
      this.setState({
        getlistArray: userlist.reverse(),
      });
    });
  }
  updateSelectUser = (selectUser) => {
    this.setState({
      selectUser,
      pageCurrent: 0,
    });
    this.updateUserList();
  }
  updatePageCount = (pageCount) => {
    this.setState({ pageCount });
  }
  getlist() {
    const viewItems = this.state.getlistArray.filter((element, index) => {
      return index >= (this.state.pageCurrent * this.state.pageCount) && index < (this.state.pageCurrent * this.state.pageCount + this.state.pageCount);
    });
    return viewItems.map((value, index) => {
      const nameJa = translateData[value.id - 1].ja;
      const nameEn = translateData[value.id - 1].en.toLowerCase();
      const url = `http://www.pokestadium.com/sprites/xy/${value.isShiny?'shiny/':''}${nameEn}.gif`;
      return (
        <Card key={`${index}-${value.id}`}>
          <Card.Content>
            <Image floated='right' size='mini' src={url} />
            <Card.Header>{nameJa}</Card.Header>
            <Card.Meta>No: {value.id}</Card.Meta>
            <Card.Description><Icon name='time' color="grey" /> {value.time}</Card.Description>
            <Card.Description>
              <Icon name='user' color="grey" /> 
              <a onClick={() => this.updateSelectUser(value.user)}>
                {value.user}
              </a>
              </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Card.Description>
              <Label>CP<Label.Detail>{value.cp}</Label.Detail></Label>
              {value.isShiny ? <Label as='a' content='shiny' icon='star' /> : null}
            </Card.Description>
          </Card.Content>
        </Card>
      );
    })
  }
  getlistArea() {
    if (this.state.getlistArray.length === 0) {
      return <Loader active inline='centered'>Loading</Loader>;
    } else {
      return <Card.Group style={{ justifyContent: 'center' }}>{this.getlist()}</Card.Group>;
    }
  }
  render() {
    return (
      <Container style={{ margin: 20 }}>
        <Header as='h2' textAlign='center'>togoshi-web</Header>
        <Grid textAlign="center" style={{ margin: '20px 0 30px' }}>
          <Statistic>
            <Statistic.Label>
              {this.state.selectUser === '' ? 'Total' : `${this.state.selectUser} が捕まえたポケモン`}
            </Statistic.Label>
            <Statistic.Value>{this.state.getlistArray.length}</Statistic.Value>
          </Statistic>
        </Grid>
        <div style={{ textAlign: 'center', margin: 20 }}>
          Number of display items : <Dropdown inline
            options={displayDropdown}
            defaultValue={displayDropdown[this.state.pageCount - 1].value}
            onChange={(e, data) => {
              this.updatePageCount(data.value);
            }}
          />
        </div>
        <div className="paginate">
          <ReactPaginate
            onPageChange={(e) => {
              this.setState({
                pageCurrent: e.selected,
              });
            }}
            forcePage={this.state.pageCurrent}
            pageCount={this.state.getlistArray.length / this.state.pageCount}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            containerClassName="ui buttons"
            activeClassName="ui button primary"
            pageClassName="ui button page"
            previousClassName="ui button"
            nextClassName="ui button"
            breakClassName="ui button break disabled"
          />
        </div>
        {this.state.selectUser === '' ? null : <div style={{ textAlign: 'center', margin: 20 }}>
          <Button onClick={this.updateAllList}>すべて表示する</Button>
        </div>}
        {this.getlistArea()}
      </Container>
    );
  }
}

export default App;