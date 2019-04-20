import {Identity} from './identity';

export class Entity extends Identity {
  static create(object, options) {
    const id = object?._id;
    if (id !== undefined) {
      const entity = this.getEntity(id);
      if (entity) {
        entity.initialize(object, options);
        return entity;
      }
    }

    return super.create(object, options);
  }

  constructor(object, options) {
    super(object, options);

    this.constructor.setEntity(this._id, this);
  }

  release() {
    this.constructor.setEntity(this._id, undefined);
  }

  serialize({_isDeep, _isFinal, ...otherOptions} = {}) {
    if (_isDeep && _isFinal) {
      // We are about to store a referenced document in the database
      return this._serializeReference();
    }
    return super.serialize({_isDeep, _isFinal, ...otherOptions});
  }

  static _serializeType() {
    return {_type: this.getName()};
  }

  _serializeId() {
    return {_id: this._id};
  }

  _serializeTypeAndId() {
    return {...this.constructor._serializeType(), ...this._serializeId()};
  }

  _serializeReference() {
    return {...this._serializeTypeAndId(), _ref: true};
  }

  static getEntity(id) {
    return this._entities?.[id];
  }

  static setEntity(id, entity) {
    if (!Object.prototype.hasOwnProperty.call(this, '_entities')) {
      this._entities = Object.create(this._entities || {});
    }
    this._entities[id] = entity;
  }

  isOfType(name) {
    return name === 'Entity' ? true : super.isOfType(name); // Optimization
  }
}