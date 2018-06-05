class MarketsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      books: [],
    };
  }

  componentDidMount() {
    Bitso.API.on('books', payload => {
      this.setState({
        loading: false,
        books: payload,
      });
    });
  }

  render() {
    const { books, loading } = this.state;

    return (
      <div className='content no-sel'>
        <Bitso.CustomList
          itemRender={props => (
            <div>
              <div className='item flex' onClick={props.itemToggle}>
                <span className='hi auto'>{props.title}</span>
                <span className={props.diff}>{props.value}</span>
              </div>
              {props.selected && (
                <div>
                  <small className='float-right'>{props.time}</small>
                  <Bitso.LineChart shown={props.diff} type='lines' data={props.data}/>
                </div>
              )}
            </div>
          )}
          caption='Mercados 30 días'
          loading={loading}
          data={books}
        />
      </div>
    );
  }
}

document.currentScript.exports = {
  MarketsWidget,
};
