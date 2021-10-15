# Haydn's Phaser Component Framework
A small wrapper around Phaser 3 that I use to make video games. It's pretty naive and "thrown together", but it does what I need it to for now. It contains abstractions for scenes, components, loading assets, and dependency injection.

## Prerequisites
* Yarn ^1.22.3
* Node ^12
* NPM ^6

## Install
Install into your project with yarn:
``` sh
yarn add https://github.com/BadMojoVeryBad/phaser-component-framework.git#master
```

You will also need to install the `reflect-metadata` package to get dependency injection to work:
``` sh
yarn add reflact-metadata
```

## Usage
The following concepts are used by this framework:

### Game
To create a game, we use the `Game` class:

``` ts
import 'reflect-metadata';
import { Game } from 'phaser-component-framework';

// Create a game that is 1280x720 pixels.
const game = Game.create(1280, 720);

// Start game.
game.start();
```

This will start a game with the specified dimensions! Note that we have to import 'reflect-metadata'. This is because the framework uses InversifyJS, which requires the additional reflection library.

### Scene

#### Adding a Scene to the Game
To add scenes to the game, create them by extending the `Scene` class:

``` ts
import { Scene } from 'phaser-component-framework';

export class DefaultScene extends Scene {
  public init(): void {
    console.log('I am a scene!');
  }
}
```

And register the scene in the game:

``` ts
...
const game = Game.create(1280, 720);

game.registerScene('default', DefaultScene);

// Start game.
game.start();
```

This will run the scene immediately after loading is complete. The first registered scene will always run immediately after the loading.

#### Changing Scenes
In this framework, we only run one scene at a time. To switch scenes, call the `changeScene()` method with the key you registered the scene with:

``` ts
import { Scene } from 'phaser-component-framework';

export class DefaultScene extends Scene {
  public init(): void {
    this.changeScene('anotherScene');
  }
}
```

#### A Note About Scenes
In this framework, we don't use the `create()` and `update()` methods on scenes. In fact, if you implement them then components will not work. We instead put or create and update logic in components, which are discussed next.

### Components
Components are a way of splitting the large amount of logic in scenes into little bits. Components can be considered as "pieces of a scene".

#### Adding Components to the Game
We can create a component like so:

``` ts
import { Component, injectable } from 'phaser-component-framework';

@injectable()
export class PlayerComponent extends Component {
  public create(): void {
    // Equivelant to the scene's create() method.
    // To access the scene:
    console.log(this.scene);
  }

  public update(time: number, delta: number): void {
    // Equivelant to the scene's update() method.
  }
}
```

Register it in the Game:

``` ts
...
const game = Game.create(1280, 720);

game.registerScene('default', DefaultScene);

game.registerComponent('player', PlayerComponent);

// Start game.
game.start();
```

Then add it to any scene we like, in the `init()` method:

``` ts
import { Scene } from 'phaser-component-framework';

export class DefaultScene extends Scene {
  public init(): void {
    this.addComponent('player');
  }
}
```

#### Init Data for Components
Data can be passed to a component through the component's `init()` method, like so:

``` ts
import { Scene } from 'phaser-component-framework';

export class DefaultScene extends Scene {
  public init(): void {
    // Pass in data.
    this.addComponent('player', {
      'someData': true
    });
  }
}
```

``` ts
import { Component, injectable } from 'phaser-component-framework';

@injectable()
export class PlayerComponent extends Component {
  public init(data: Record<string, unknown>): void {
    // Get the data in the component.
    console.log(data.someData);
  }
}
```

#### Dependency Injection in Components
Components are created using a service container, which means we can inject services into their contructor:

``` ts
import { Component, injectable, inject } from 'phaser-component-framework';

@injectable()
export class PlayerComponent extends Component {
  // The controls interface is explained in the 'Controls' section.
  constructor(@inject('controls') private controls: ControlsInterface) {
    super();
  }
}
```

### Assets
This framework automatically handles loading assets. To register an asset for loading, we call `registerAsset()`:

``` ts
...
const game = Game.create(1280, 720);

game.registerScene('default', DefaultScene);

game.registerComponent('player', PlayerComponent);

game.registerAsset('playerSprite', 'assets/playerSprite.png');

// Start game.
game.start();
```

It will be automatically loaded, and available for us to use in components:

``` ts
import { Component, injectable } from 'phaser-component-framework';

@injectable()
export class PlayerComponent extends Component {
  public create(): void {
    this.scene.add.image(this.scene.width() / 2, this.scene.height() / 2, 'playerSprite').setScale(0.25);
  }
}
```

Assets can be `.png` files for images, `.ogg` files for audio, and `.json` filed for tiled map editor maps. There is also a special case where if you pass two paths to the `registerAsset()` method, it will load the asset as a texture atlas.

### Controls
Controls are annoying to configure, so this framework has an abstraction for to. To register a control, call the `registerControl()` method:

``` ts
...
const game = Game.create(1280, 720);

// Register scenes and components and assets here.
// ...

// Control:
game.registerControl('UP', 'Keyboard.38', 'Gamepad.UP');

// Start game.
game.start();
```

As you can see, we're mapping the string 'UP', to the up arrow key on the keyboard (keycode 38), and the up button on a gamepad. Now in our components, we can use the `ControlsInterface` to check in this control is active:

``` ts
import { Component, injectable, inject } from 'phaser-component-framework';

@injectable()
export class PlayerComponent extends Component {
  constructor(@inject('controls') private controls: ControlsInterface) {
    super();
  }

  update(time: number, delta: number): void {
    console.log(controls.isActive('UP'));
  }
}
```

Now if the up arrow jey OR up on the gamepad button are pressed, `isActive()` be truth-ey.

### Custom Services
Finally, if we write any custom service we want to `inject()` into our components, we can register them like so:

``` ts
...
const game = Game.create(1280, 720);

// Register scenes, components, assets, and controls here.
// ...

// Service:
game.registerService<ExampleServiceInterface>('example', ExampleService);

// Start game.
game.start();
```

Now we can inject the `ExampleService` into components:

``` ts
import { Component, injectable, inject } from 'phaser-component-framework';

@injectable()
export class PlayerComponent extends Component {
  // The controls interface is explained in the 'Controls' section.
  constructor(@inject('example') private exampleService: ExampleServiceInterface) {
    exampleService.foo();
    super();
  }
}
```
